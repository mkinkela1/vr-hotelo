# Troubleshooting "No Available Server" Error

## Quick Diagnostic Steps

### 1. Check Container Status in Coolify
- Go to your application in Coolify
- Check if the container is **Running** (green status)
- Check the **Logs** tab - is the app starting correctly?
- Look for: `"Ready on http://0.0.0.0:3000"` or similar

### 2. Verify Port Configuration
In Coolify application settings:
- **Ports** section should show: `3000` (or `3000:3000`)
- The port should be **exposed** (not just internal)

### 3. Check Network Configuration
- In Coolify, your app should be on the **coolify** network
- Traefik should also be on the **coolify** network
- Both should be able to communicate

### 4. Test Container Directly
If you have SSH access to the Coolify server:
```bash
# Find your container
docker ps | grep fwkw8g8gww00g4ggg0w8gg4s

# Test if port 3000 is accessible from Traefik network
docker exec coolify-proxy wget -O- http://<container-ip>:3000
# Or test by container name
docker exec coolify-proxy wget -O- http://<container-name>:3000
```

## Common Issues and Fixes

### Issue 1: Container Not Running
**Symptoms:** "no available server" immediately

**Fix:**
1. Check Coolify logs for startup errors
2. Verify environment variables are set correctly
3. Check database connection (if app waits for DB)
4. Restart the container

### Issue 2: Wrong Port
**Symptoms:** Container running but Traefik can't connect

**Fix:**
1. Verify app is listening on port 3000:
   ```bash
   # In container logs, look for:
   "Ready on http://0.0.0.0:3000"
   ```
2. Check Dockerfile: `EXPOSE 3000`
3. Verify Coolify port mapping: `3000:3000` or just `3000`

### Issue 3: Network Isolation
**Symptoms:** Container running, port correct, but still "no available server"

**Fix:**
1. In Coolify, check **Network** settings
2. Ensure app is on `coolify` network
3. Try removing and re-adding the network label

### Issue 4: Service Discovery Issue
**Symptoms:** Everything looks correct but Traefik can't find the service

**Fix:**
Try using Coolify's auto-discovery instead of manual service definitions.

## Alternative: Simplified Configuration

If manual service definitions aren't working, try letting Coolify auto-discover:

Remove all `traefik.http.services.*` labels and let Coolify handle service discovery automatically. Only keep:
- Router definitions
- Middleware definitions
- TLS configuration

## Check Traefik Logs

If you have access to Traefik logs:
```bash
docker logs coolify-proxy | grep -i "no available server"
docker logs coolify-proxy | grep -i "fwkw8g8gww00g4ggg0w8gg4s"
```

Look for:
- Container discovery messages
- Service registration errors
- Network connection errors

## Verify Configuration Applied

In Coolify:
1. Go to your application
2. Check **Labels** section
3. Verify all labels from `traefik-config.txt` are present
4. Look for any errors or warnings

## Test After Fix

```bash
# Should return 200 or 301/302, not 503
curl -I https://app.vrhotelo.com

# Check Traefik dashboard (if accessible)
# Look for your service in the HTTP services list
```

