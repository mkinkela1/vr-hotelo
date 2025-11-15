# Coolify Proxy Configuration for Large Uploads

## Critical: Proxy Timeouts

Even with all the DNS and application fixes, **Coolify's reverse proxy might still timeout** before your 30-minute upload completes.

Coolify typically uses **Traefik** or **Nginx** as a reverse proxy, and these have default timeouts that are too short for large file uploads.

## Identifying Your Proxy

### Check What Coolify Uses

In your Coolify dashboard or via SSH:

```bash
# Check if Traefik is running
docker ps | grep traefik

# Or check if Nginx is running
docker ps | grep nginx
```

## Configuration for Traefik (Most Common)

Coolify typically uses Traefik. You need to add labels to your application.

### Option 1: Via Coolify UI

In your Coolify application settings, add these **Docker Labels**:

```yaml
# Increase read/write timeouts to 30 minutes
traefik.http.services.vrhotelo.loadbalancer.server.timeout=1800s

# Increase forward auth timeout
traefik.http.middlewares.vrhotelo-timeout.forwardauth.timeout=1800s

# Allow large request bodies (5GB)
traefik.http.middlewares.vrhotelo-buffering.buffering.maxRequestBodyBytes=5368709120

# Increase response header timeout
traefik.http.middlewares.vrhotelo-headers.headers.customresponseheaders.X-Request-Timeout=1800
```

### Option 2: Via Traefik Config File

If you have access to Traefik's configuration:

**File:** `/etc/traefik/traefik.yml` or `traefik.toml`

```yaml
# In Traefik static configuration
serversTransport:
  insecureSkipVerify: true
  responseHeaderTimeout: 1800s
  
# In Traefik dynamic configuration
http:
  services:
    vrhotelo:
      loadBalancer:
        servers:
          - url: "http://your-container:3000"
        healthCheck:
          path: /api/health
          interval: 30s
          timeout: 5s
        responseForwarding:
          flushInterval: 100ms
        # CRITICAL: Set timeout to 30 minutes
        serversTransport:
          forwardingTimeouts:
            responseHeaderTimeout: 1800s
            idleConnTimeout: 1800s
```

Then restart Traefik:

```bash
docker restart coolify-proxy
# or
docker restart traefik
```

## Configuration for Nginx

If Coolify uses Nginx instead:

### Find Nginx Config

```bash
# Locate Nginx config
docker exec coolify-proxy cat /etc/nginx/nginx.conf
# or
cat /etc/nginx/sites-enabled/vrhotelo.conf
```

### Add These Directives

In the `server` or `location` block for your application:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # CRITICAL: Increase timeouts for large uploads
    client_max_body_size 5G;          # Allow 5GB files
    client_body_timeout 1800s;         # 30 minutes
    send_timeout 1800s;                # 30 minutes
    
    location / {
        proxy_pass http://your-container:3000;
        
        # Proxy timeouts
        proxy_connect_timeout 120s;     # 2 minutes for connection
        proxy_send_timeout 1800s;       # 30 minutes for sending request
        proxy_read_timeout 1800s;       # 30 minutes for reading response
        
        # Buffer settings for large uploads
        proxy_buffering off;            # Disable buffering for uploads
        proxy_request_buffering off;    # Stream uploads directly
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Keep connection alive
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

Then reload Nginx:

```bash
docker exec coolify-proxy nginx -s reload
# or
sudo systemctl reload nginx
```

## Testing Proxy Configuration

### Test 1: Check Timeout Values

```bash
# For Traefik
docker exec coolify-proxy cat /etc/traefik/traefik.yml | grep -i timeout

# For Nginx
docker exec coolify-proxy cat /etc/nginx/nginx.conf | grep -i timeout
```

### Test 2: Test Large Upload

1. Deploy your application with DNS fixes
2. Try uploading a 1GB file (should take ~2-3 minutes)
3. If it completes, try a 3GB file (~6-10 minutes)
4. If it completes, try a 5GB file (~10-15 minutes)

### Test 3: Monitor Logs

```bash
# Watch proxy logs
docker logs -f coolify-proxy

# Watch application logs
docker logs -f your-vrhotelo-container
```

Look for:
- ✅ No "504 Gateway Timeout" errors
- ✅ No "upstream timed out" errors
- ✅ Upload progress in application logs

## Coolify Environment Variables

In addition to proxy config, set these in Coolify:

```bash
# In Coolify application environment variables
NODE_OPTIONS=--max-old-space-size=8000
NODE_ENV=production

# R2 Configuration
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
```

## Coolify Resource Limits

Ensure your application has sufficient resources:

**Recommended Minimums:**
- **Memory:** 4GB (for handling large files)
- **CPU:** 2 cores
- **Disk:** Sufficient for temporary file storage

In Coolify, set these in your application settings under "Resources".

## Complete Checklist for Production

- [ ] Application code deployed (DNS fixes)
- [ ] Proxy timeout configured (30 minutes)
- [ ] Client max body size set (5GB)
- [ ] Memory limit set (4GB)
- [ ] Environment variables configured
- [ ] Test 1GB upload (success)
- [ ] Test 3GB upload (success)
- [ ] Test 5GB upload (success)

## Troubleshooting

### Issue: 504 Gateway Timeout After 60 Seconds

**Cause:** Proxy timeout not configured

**Solution:**
1. Add Traefik labels with 1800s timeout
2. Or configure Nginx timeouts
3. Restart proxy container
4. Redeploy application

### Issue: 413 Request Entity Too Large

**Cause:** Proxy not allowing large bodies

**Solution:**
- **Traefik:** Add `buffering.maxRequestBodyBytes` label
- **Nginx:** Set `client_max_body_size 5G;`

### Issue: Upload Starts But Fails After 5-10 Minutes

**Cause:** Partial proxy timeout configuration

**Solution:**
- Check both `read_timeout` and `send_timeout`
- Ensure connection keepalive is enabled
- Disable request buffering

### Issue: Memory Errors During Upload

**Cause:** Insufficient container memory

**Solution:**
- Increase memory limit to 4GB in Coolify
- Check disk space for temporary files
- Monitor container resources during upload

## Architecture Flow

```
User Browser (3GB upload)
    ↓
Internet
    ↓
Coolify Proxy (Traefik/Nginx) ← MUST CONFIGURE 30min TIMEOUT
    ↓ (docker network)
Your Container (Next.js + Node)
    ↓ (DNS: 1.1.1.1, retry logic)
Cloudflare R2 (destination)
```

Each layer needs proper configuration!

## Quick Fix for Traefik (Copy-Paste)

If you're using Coolify with Traefik, add these exact labels in Coolify UI:

```
traefik.http.services.vrhotelo-cms.loadbalancer.server.timeout=1800s
traefik.http.middlewares.vrhotelo-cms-buffering.buffering.maxRequestBodyBytes=5368709120
```

Replace `vrhotelo-cms` with your actual service name (check existing Traefik labels).

## Verification Commands

After configuration:

```bash
# 1. Check Traefik config loaded
docker exec coolify-proxy traefik version
docker logs coolify-proxy | grep -i timeout

# 2. Test proxy is responding
curl -I https://your-domain.com

# 3. Test application is accessible
curl https://your-domain.com/admin

# 4. Check container resources
docker stats your-container-name
```

## Summary

**Without proxy configuration:** Your upload will likely fail with 504 Gateway Timeout even though your application supports it.

**With proxy configuration:** Uploads should work end-to-end.

**Priority:**
1. ✅ Deploy application code (DNS fixes) ← Already done
2. 🎯 Configure proxy timeouts ← DO THIS NEXT
3. ✅ Test large file upload ← Then test

Good luck! 🚀

