# Production Deployment DNS Configuration (Coolify)

## Important Context

You're deploying to **Coolify** using GitHub Actions, and large file uploads (3+ GB) are failing in production but working locally.

## Why Production is Different

| Environment                    | DNS Configuration                                       |
| ------------------------------ | ------------------------------------------------------- |
| **Local (docker-compose.yml)** | DNS servers set in docker-compose.yml                   |
| **Production (Coolify)**       | Uses Dockerfile only - docker-compose DNS doesn't apply |

## Solution: Application-Level DNS (Already Applied)

The DNS fixes in `src/plugins/s3.plugin.ts` will work in **both local AND production** because they're part of your application code:

```typescript
// These lines execute when your app starts, regardless of environment
dns.setServers([
  '1.1.1.1', // Cloudflare DNS
  '1.0.0.1', // Cloudflare DNS
  '8.8.8.8', // Google DNS
  '8.8.4.4', // Google DNS
])
```

This means your production deployment should automatically get the DNS fixes when you push the updated code.

## Deployment Workflow

Your current workflow (`.github/workflows/deploy.yml`):

1. ✅ GitHub Actions builds Dockerfile
2. ✅ Pushes to Docker Hub
3. ✅ Coolify pulls and deploys the image
4. ✅ **New code with DNS fixes is included**

## Additional Coolify Configuration (Optional but Recommended)

If you still experience DNS issues in production after deploying, you can configure DNS at the Coolify level:

### Option 1: Coolify Environment Variables

In your Coolify application settings, you can add these environment variables:

```bash
# These won't directly set DNS but can be used by the app
DNS_SERVERS=1.1.1.1,1.0.0.1,8.8.8.8,8.8.4.4
```

### Option 2: Coolify Docker Daemon DNS

If Coolify has access to Docker daemon configuration, you can set DNS servers globally:

1. SSH into your Coolify server
2. Edit `/etc/docker/daemon.json`:

```json
{
  "dns": ["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]
}
```

3. Restart Docker:

```bash
sudo systemctl restart docker
```

4. Redeploy your application in Coolify

### Option 3: Coolify Container DNS Override

In Coolify UI, if there's an option to add Docker run arguments:

```bash
--dns=1.1.1.1 --dns=1.0.0.1 --dns=8.8.8.8 --dns=8.8.4.4
```

## Testing in Production

After deploying the updated code:

### 1. Check Application Logs

In Coolify, view your application logs:

```bash
# Look for DNS retry messages
DNS lookup failed for ..., attempt 1/3, retrying...
DNS lookup failed for ..., attempt 2/3, retrying...
```

### 2. Test DNS from Production Container

If you can access the container shell in Coolify:

```bash
# Check DNS servers
cat /etc/resolv.conf

# Test DNS resolution
nslookup vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com

# Test connectivity
wget --spider https://vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
```

### 3. Monitor Upload Attempts

Watch for these in production logs:

**Success indicators:**

- ✅ No `EAI_AGAIN` errors
- ✅ Retry attempts working (attempts > 1)
- ✅ DNS lookup retry messages (if DNS fails temporarily)
- ✅ Upload completes successfully

**Failure indicators:**

- ❌ `EAI_AGAIN` errors still occurring
- ❌ `attempts: 1` (retries not working)
- ❌ Connection timeouts

## Deployment Checklist

Before deploying to production:

- [x] ✅ Code changes committed (`src/plugins/s3.plugin.ts`)
- [x] ✅ Package dependency added (`@smithy/node-http-handler`)
- [x] ✅ Next.js config updated (5GB limit)
- [x] ✅ API route timeout extended (30 minutes)
- [ ] ⏳ Push code to master branch
- [ ] ⏳ GitHub Actions builds and deploys
- [ ] ⏳ Test large file upload in production
- [ ] ⏳ Monitor logs for DNS issues

## Pushing the Changes

To deploy the DNS fixes to production:

```bash
# 1. Ensure all changes are staged
git status

# 2. Add any remaining files
git add .

# 3. Commit with descriptive message
git commit -m "Fix: Add DNS configuration and retries for large file uploads to R2

- Configure custom DNS servers (Cloudflare, Google)
- Add DNS retry logic with exponential backoff
- Increase S3 retry attempts to 10
- Extend connection timeouts to 120 seconds
- Add adaptive retry mode for better error handling
- Increase API route timeout to 30 minutes
- Add Next.js 5GB body size limit"

# 4. Push to master (triggers deployment)
git push origin master
```

This will trigger your GitHub Actions workflow and deploy to Coolify.

## After Deployment

### Monitor the Deployment

1. **GitHub Actions:**
   - Watch the workflow in GitHub Actions tab
   - Ensure build completes successfully
   - Verify Docker push succeeds
   - Confirm Coolify deployment trigger

2. **Coolify Dashboard:**
   - Check deployment status
   - Watch container restart
   - View application logs

3. **Test Large Upload:**
   - Navigate to your production Payload admin
   - Try uploading a 3+ GB file
   - Monitor progress and logs

## Troubleshooting Production Issues

### Issue: Still Getting DNS Errors in Production

**Solution 1: Verify Code Deployed**

Check that the new code is actually running:

```bash
# In Coolify container shell
grep -r "dns.setServers" /app/src/plugins/
# Should show the DNS configuration
```

**Solution 2: Check Container DNS**

```bash
cat /etc/resolv.conf
# If it still shows default DNS (like 127.0.0.11), the application-level
# DNS setting should still work, but you may want to configure Docker daemon DNS
```

**Solution 3: Increase Retry Attempts**

If DNS is unreliable in your production network, increase retries:

In `src/plugins/s3.plugin.ts`:

```typescript
maxAttempts: 15,  // Increase from 10 to 15
```

And in the DNS lookup function:

```typescript
if (err && attemptNum < 5) {  // Increase from 3 to 5
```

**Solution 4: Check Network/Firewall**

Ensure your Coolify server can reach:

- Cloudflare DNS (1.1.1.1, 1.0.0.1)
- Google DNS (8.8.8.8, 8.8.4.4)
- R2 endpoint (\*.r2.cloudflarestorage.com)

```bash
# From Coolify server
ping -c 3 1.1.1.1
nslookup vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com 1.1.1.1
```

### Issue: Uploads Still Timeout

If DNS is fine but uploads timeout:

1. **Check Coolify's reverse proxy timeout:**
   - Nginx/Traefik might have default timeouts
   - Configure proxy to allow 30+ minute requests

2. **Check server resources:**
   - Ensure sufficient memory (4GB+)
   - Check CPU usage during upload
   - Monitor network bandwidth

3. **Check R2 connectivity from production:**
   ```bash
   curl -v https://vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
   ```

## Expected Production Behavior

### During Upload (3GB+ file):

```
[INFO] Starting upload: video.mp4 (3.2GB)
[DEBUG] S3 multipart upload initiated
[DEBUG] Part 1/640 uploaded (5MB)
[DEBUG] Part 2/640 uploaded (5MB)
...
[DEBUG] DNS lookup failed for r2.cloudflarestorage.com, attempt 1/3, retrying...
[DEBUG] DNS resolution successful
...
[DEBUG] Part 640/640 uploaded (5MB)
[INFO] Upload completed successfully
```

### Expected timeline:

- 3GB file: ~6-10 minutes
- 5GB file: ~10-15 minutes

## Architecture Overview

```
User Browser
    ↓ (Upload)
Coolify (Nginx/Traefik)
    ↓ (30 min timeout needed)
Next.js App (Docker Container)
    ↓ (DNS: 1.1.1.1, 8.8.8.8)
Node.js HTTP Agent (120s timeout)
    ↓ (10 retry attempts)
Cloudflare R2
```

Each layer needs proper timeout configuration for large uploads.

## Coolify-Specific Configuration

### Nginx Timeout (if using Nginx)

If Coolify uses Nginx, ensure these are set:

```nginx
# In Coolify's Nginx config
proxy_read_timeout 1800s;
proxy_connect_timeout 120s;
proxy_send_timeout 1800s;
client_max_body_size 5G;
```

### Traefik Timeout (if using Traefik)

If Coolify uses Traefik:

```yaml
# In Traefik config
- 'traefik.http.services.vrhotelo.loadbalancer.server.timeout=1800s'
- 'traefik.http.middlewares.vrhotelo-timeout.forwardauth.timeout=1800s'
```

Check with Coolify documentation on how to set these.

## Summary

**The good news:** Your DNS fixes are in the application code and will deploy to production automatically when you push to master.

**The key difference:** Local uses `docker-compose.yml` DNS settings + application code. Production uses only application code DNS settings.

**What to do:**

1. ✅ Code changes are ready (DNS fixes in s3.plugin.ts)
2. 🔄 Commit and push to master
3. 🚀 Let GitHub Actions deploy to Coolify
4. 🧪 Test large file upload in production
5. 📊 Monitor logs for DNS retry messages
6. ✨ Should work! If not, configure Coolify's reverse proxy timeouts

## Need Help?

If production uploads still fail after deployment:

1. Check Coolify logs for DNS errors
2. Verify reverse proxy (Nginx/Traefik) timeout settings
3. Test DNS from production container
4. Check server resources (CPU, memory, network)
5. Contact Coolify support for infrastructure-specific issues

Good luck with the deployment! 🚀
