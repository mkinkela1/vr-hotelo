# Quick Start: DNS Fix for Large File Uploads

## The Problem

You're getting `EAI_AGAIN` DNS resolution errors when uploading large files to R2:

```
ERROR: getaddrinfo EAI_AGAIN vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
```

## The Solution (3 Steps)

### Step 1: Verify the Changes

The following files have been updated with DNS fixes:

- ✅ `src/plugins/s3.plugin.ts` - DNS configuration + retry logic
- ✅ `docker-compose.yml` - DNS servers configuration
- ✅ `next.config.mjs` - 5GB body size limit
- ✅ `src/app/(payload)/api/[...slug]/route.ts` - 30 min timeout

### Step 2: Restart Docker (CRITICAL!)

**The DNS configuration WILL NOT work until you restart Docker Compose:**

```bash
# Stop and remove containers
docker-compose down

# Start with new configuration
docker-compose up

# Or run in background
docker-compose up -d
```

### Step 3: Test DNS Resolution

Run the DNS troubleshooting script:

```bash
./test-dns.sh
```

Expected output should show:
- ✓ System DNS resolution: SUCCESS
- ✓ Cloudflare DNS: SUCCESS
- ✓ Google DNS: SUCCESS
- ✓ HTTPS connection: SUCCESS

### Step 4: Test Upload

Now try uploading your large file again. You should see:

- ✅ No more `EAI_AGAIN` errors
- ✅ Upload progressing smoothly
- ✅ Retry attempts working if needed (attempts > 1)

## What Was Fixed?

### 1. Docker DNS Configuration

Your Docker container now uses reliable DNS servers:
- Cloudflare DNS: 1.1.1.1, 1.0.0.1
- Google DNS: 8.8.8.8, 8.8.4.4 (fallback)

### 2. Application-Level DNS Retry

The S3 plugin now:
- Retries DNS lookups 3 times with exponential backoff
- Uses adaptive retry mode (10 attempts total)
- Prefers IPv4 addresses
- Has extended timeouts (2 minutes for connection)

### 3. Custom DNS Lookup Function

A custom DNS resolver in the HTTPS agent that:
- Automatically retries failed DNS lookups
- Logs DNS failures for debugging
- Uses exponential backoff (1s, 2s, 3s)

## Still Having Issues?

### Check 1: DNS from Inside Docker

```bash
# Check DNS servers configured in container
docker-compose exec payload cat /etc/resolv.conf

# Should show:
# nameserver 1.1.1.1
# nameserver 1.0.0.1
# nameserver 8.8.8.8
# nameserver 8.8.4.4

# Test DNS resolution
docker-compose exec payload nslookup vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
```

### Check 2: Network Connectivity

```bash
# Test internet connectivity from container
docker-compose exec payload ping -c 3 1.1.1.1

# Test HTTPS connectivity to R2
docker-compose exec payload wget --spider https://vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
```

### Check 3: Docker Logs

Watch the logs during upload:

```bash
docker-compose logs -f payload
```

You should see:
- DNS lookup retry messages if there are issues
- Increasing attempt numbers (1, 2, 3...)
- No `EAI_AGAIN` errors

### Check 4: System-Level DNS

If DNS still fails, configure Docker daemon DNS:

**On macOS (Docker Desktop):**
1. Open Docker Desktop
2. Go to Settings → Docker Engine
3. Add DNS configuration:

```json
{
  "dns": ["1.1.1.1", "8.8.8.8"]
}
```

4. Click "Apply & Restart"

**On Linux:**

Edit `/etc/docker/daemon.json`:

```json
{
  "dns": ["1.1.1.1", "8.8.8.8"]
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

## Understanding the Logs

### Before the Fix:
```
ERROR: getaddrinfo EAI_AGAIN ...
"attempts": 1,
"totalRetryDelay": 0
```

### After the Fix:
```
DNS lookup failed for ..., attempt 1/3, retrying...
DNS lookup failed for ..., attempt 2/3, retrying...
✓ DNS resolution successful
"attempts": 3,
"totalRetryDelay": 3000
```

## Performance Expectations

With the DNS fix in place:

| File Size | Expected Upload Time |
|-----------|---------------------|
| 1 GB      | 2-3 minutes         |
| 2 GB      | 4-5 minutes         |
| 3 GB      | 6-8 minutes         |
| 5 GB      | 10-15 minutes       |

*Based on 100 Mbps connection*

## Need More Help?

1. Check the full documentation: `LARGE_FILE_UPLOAD.md`
2. Run the DNS diagnostic: `./test-dns.sh`
3. Check Docker logs: `docker-compose logs -f payload`
4. Verify R2 endpoint is correct in your `.env` file

## Summary

The main issue was **DNS resolution failures in Docker**. We fixed it by:

1. ✅ Configuring reliable DNS servers in docker-compose.yml
2. ✅ Adding DNS retry logic in the application code
3. ✅ Increasing retry attempts and timeouts
4. ✅ Using adaptive retry mode for better error handling

**Remember:** You MUST restart Docker Compose for the changes to take effect!

```bash
docker-compose down && docker-compose up
```

