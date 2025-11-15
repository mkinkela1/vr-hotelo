# Diagnostic Checklist for "No Available Server" Error

## Step-by-Step Diagnosis

### ✅ Step 1: Verify Container is Running

**In Coolify Dashboard:**
1. Go to your application
2. Check the **Status** - should be green "Running"
3. If not running:
   - Check **Logs** tab for errors
   - Look for database connection issues
   - Verify environment variables are set

**What to look for in logs:**
```
✓ "Ready on http://0.0.0.0:3000"
✓ "Server started"
✓ No fatal errors
```

### ✅ Step 2: Verify Port Configuration

**In Coolify Application Settings:**
1. Go to **Ports** section
2. Should show: `3000` or `3000:3000`
3. Port should be **exposed** (not just internal)

**If port is wrong:**
- Change to `3000` in Coolify UI
- Save and restart

### ✅ Step 3: Check Network Configuration

**In Coolify:**
1. Your application should be on the **coolify** network
2. Traefik proxy should also be on **coolify** network
3. Both containers should be able to communicate

**To verify (if you have SSH access):**
```bash
# Check container networks
docker inspect <your-container-name> | grep -A 10 Networks
docker inspect coolify-proxy | grep -A 10 Networks

# Both should show "coolify" network
```

### ✅ Step 4: Verify Labels Are Applied

**In Coolify:**
1. Go to **Settings** → **Labels** (or **Custom Labels**)
2. Verify these labels exist:
   - `traefik.enable=true`
   - `traefik.docker.network=coolify`
   - At least one router definition
   - Service definitions with port 3000

**If labels are missing:**
- Copy entire `traefik-config.txt` again
- Paste into Coolify labels section
- Save and restart

### ✅ Step 5: Check Traefik Can See Your Container

**If you have SSH access to Coolify server:**
```bash
# List containers Traefik can see
docker exec coolify-proxy traefik api --raw | grep -i fwkw8g8gww00g4ggg0w8gg4s

# Or check Traefik logs
docker logs coolify-proxy | grep -i "no available server"
docker logs coolify-proxy | grep -i fwkw8g8gww00g4ggg0w8gg4s
```

### ✅ Step 6: Test Container Directly

**From Traefik container (if accessible):**
```bash
# Find your container IP
docker inspect <your-container-name> | grep IPAddress

# Test connection from Traefik
docker exec coolify-proxy wget -O- http://<container-ip>:3000
```

**From your container:**
```bash
# Test if app is listening
docker exec <your-container-name> wget -O- http://localhost:3000
```

## Common Fixes

### Fix 1: Container Not Starting
**Symptoms:** Container keeps restarting or won't start

**Solution:**
1. Check logs for errors
2. Verify DATABASE_URI is correct
3. Check if migrations are failing
4. Verify all required environment variables are set

### Fix 2: Port Not Exposed
**Symptoms:** Container running but Traefik can't connect

**Solution:**
1. In Coolify, go to **Ports** section
2. Ensure port `3000` is exposed
3. Save and restart

### Fix 3: Network Issue
**Symptoms:** Container running, port correct, but still "no available server"

**Solution:**
1. In Coolify, check **Network** settings
2. Ensure app is on `coolify` network
3. Try removing `traefik.docker.network=coolify` label temporarily
4. Let Coolify auto-assign network

### Fix 4: Service Discovery Issue
**Symptoms:** Everything looks correct but Traefik can't find service

**Solution:**
Try this simplified approach - remove explicit service definitions and let Coolify auto-discover:

1. Keep only router and middleware labels
2. Remove all `traefik.http.services.*` labels
3. Let Coolify handle service discovery automatically
4. Restart and test

## Quick Test Commands

```bash
# Test from outside (should work)
curl -I https://app.vrhotelo.com

# Test from Traefik container (if accessible)
docker exec coolify-proxy curl -I http://<container-name>:3000

# Check container status
docker ps | grep fwkw8g8gww00g4ggg0w8gg4s

# Check container logs
docker logs <container-name> --tail 50
```

## What to Report

If still not working, provide:
1. Container status (running/stopped/restarting)
2. Container logs (last 50 lines)
3. Port configuration from Coolify
4. Network configuration
5. Traefik logs (if accessible)
6. Any error messages from Coolify UI

