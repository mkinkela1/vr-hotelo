# Large File Upload Fix - Complete Summary

## 🎯 Your Situation

- ✅ **Local:** Works fine (or will with docker-compose restart)
- ❌ **Production (Coolify):** Large uploads failing with DNS errors
- 🎬 **File size:** 3+ GB video files
- 🌐 **Storage:** Cloudflare R2

## 🔧 What Was Fixed

### 1. Application Code (Works Local + Production)

**File:** `src/plugins/s3.plugin.ts`
- ✅ Custom DNS servers (Cloudflare 1.1.1.1, Google 8.8.8.8)
- ✅ DNS retry logic (3 attempts with exponential backoff)
- ✅ S3 retry logic (10 attempts, adaptive mode)
- ✅ Extended timeouts (2 min connection, 30 min request)
- ✅ HTTP keepalive enabled

**File:** `next.config.mjs`
- ✅ 5GB body size limit

**File:** `src/app/(payload)/api/[...slug]/route.ts`
- ✅ 30 minute API route timeout

### 2. Local Development Only

**File:** `docker-compose.yml`
- ✅ DNS servers for local container
- ✅ Memory limits (4GB)
- ✅ File descriptor limits

## 📋 Deployment Steps

### For Local (Development)

```bash
# 1. Restart Docker Compose to apply DNS settings
docker-compose down
docker-compose up

# 2. Test DNS
./test-dns.sh

# 3. Try uploading large file
# Should work now!
```

### For Production (Coolify)

#### Step 1: Deploy Code Changes

```bash
# Commit and push
git add .
git commit -m "Fix: DNS and timeout configuration for large R2 uploads"
git push origin master

# Wait for GitHub Actions to build and deploy (~10-15 min)
```

#### Step 2: Configure Coolify Proxy (CRITICAL!)

**Your Coolify likely uses Traefik.** You need to add these labels in Coolify UI:

Navigate to: **Your App → Settings → Docker Labels**

Add these labels:

```
traefik.http.services.vrhotelo-cms.loadbalancer.server.timeout=1800s
traefik.http.middlewares.vrhotelo-cms-buffering.buffering.maxRequestBodyBytes=5368709120
```

*(Replace `vrhotelo-cms` with your actual service name)*

**Why?** Without this, Traefik will timeout the upload after 60 seconds even though your app can handle it!

#### Step 3: Test in Production

1. Wait for deployment to complete
2. Navigate to production admin panel
3. Try uploading a 1GB file first (test)
4. Then try your 3+ GB file
5. Monitor logs in Coolify dashboard

## 📚 Documentation Guide

### Quick Reference (Start Here)
- **`DNS_FIX_QUICK_START.md`** - Quick guide for local testing
- **`DEPLOY_DNS_FIX.md`** - How to deploy to production

### Production Deployment
- **`PRODUCTION_DEPLOYMENT_DNS.md`** - Detailed production guide
- **`COOLIFY_PROXY_CONFIG.md`** - Traefik/Nginx configuration

### Comprehensive Docs
- **`LARGE_FILE_UPLOAD.md`** - Complete technical documentation
- **`test-dns.sh`** - DNS diagnostic script

## 🚨 Common Issues & Solutions

### Issue: Local uploads still fail

**Solution:**
```bash
# Did you restart Docker?
docker-compose down
docker-compose up

# Test DNS is working
./test-dns.sh
```

### Issue: Production uploads fail with 504 Gateway Timeout

**Cause:** Coolify's proxy timeout not configured

**Solution:**
1. Read `COOLIFY_PROXY_CONFIG.md`
2. Add Traefik labels (see Step 2 above)
3. Restart application in Coolify
4. Test again

### Issue: Production uploads fail with DNS errors

**Cause:** Code not deployed yet

**Solution:**
```bash
# Verify code is pushed
git status
git log -1

# Check GitHub Actions
# https://github.com/your-repo/actions

# Check Coolify deployment status
```

### Issue: Uploads fail after 15-20 minutes

**Cause:** Insufficient timeout settings

**Solution:**
- Check proxy timeout is set to 1800s (30 min)
- Check API route timeout is 1800 (30 min)
- Check Next.js body size limit is 5GB
- Monitor server resources (CPU, memory)

## 🧪 Testing Checklist

### Local Testing

- [ ] Restart Docker Compose
- [ ] Run `./test-dns.sh` (all tests pass)
- [ ] Upload 100MB file (quick test)
- [ ] Upload 1GB file (~2 min)
- [ ] Upload 3GB+ file (~6-10 min)

### Production Testing

- [ ] Code deployed to master
- [ ] GitHub Actions completed
- [ ] Coolify shows "Running"
- [ ] Traefik labels configured
- [ ] Upload 100MB file (quick test)
- [ ] Upload 1GB file (~2 min)
- [ ] Upload 3GB+ file (~6-10 min)
- [ ] Check logs (no DNS errors)

## 📊 Expected Performance

| File Size | Upload Time (100 Mbps) |
|-----------|----------------------|
| 100 MB    | ~30 seconds          |
| 500 MB    | ~1-2 minutes         |
| 1 GB      | ~2-3 minutes         |
| 2 GB      | ~4-5 minutes         |
| 3 GB      | ~6-8 minutes         |
| 5 GB      | ~10-15 minutes       |

*Times vary based on network speed*

## 🎬 What Happens During Upload

```
1. Browser → Sends file to Next.js API
2. Next.js → Validates file (5GB limit checked)
3. Node.js → DNS lookup for R2 (with retry)
4. S3 SDK → Splits into 5MB chunks (multipart)
5. Each chunk → Uploads with retry logic
6. S3 SDK → Assembles chunks on R2 side
7. Next.js → Returns success
```

**Each step has retry logic and timeouts configured!**

## 🔍 Monitoring

### Watch Logs During Upload

**Local:**
```bash
docker-compose logs -f payload
```

**Production (Coolify):**
- Open Coolify dashboard
- Navigate to your application
- Click "Logs" tab
- Watch in real-time

**What to look for:**
- ✅ "DNS lookup failed, retrying..." (retries working!)
- ✅ No `EAI_AGAIN` errors
- ✅ Multipart upload progress
- ✅ "Upload completed successfully"

## 🆘 Need Help?

### Diagnostic Commands

```bash
# Test DNS resolution
./test-dns.sh

# Test from inside Docker
docker-compose exec payload nslookup r2.cloudflarestorage.com

# Check container resources
docker stats

# View recent logs
docker-compose logs --tail=100 payload
```

### Check These

1. **DNS:** Is custom DNS working? (Run test-dns.sh)
2. **Network:** Can you reach 1.1.1.1 and R2 endpoint?
3. **Memory:** Does container have 4GB?
4. **Proxy:** Is Traefik timeout configured? (Coolify only)
5. **Code:** Is latest code deployed?

## 📦 Files Changed (For Git)

```
Modified:
- src/plugins/s3.plugin.ts
- next.config.mjs
- src/app/(payload)/api/[...slug]/route.ts
- docker-compose.yml
- package.json (added @smithy/node-http-handler)

Added:
- LARGE_FILE_UPLOAD.md
- DNS_FIX_QUICK_START.md
- DEPLOY_DNS_FIX.md
- PRODUCTION_DEPLOYMENT_DNS.md
- COOLIFY_PROXY_CONFIG.md
- README_LARGE_UPLOADS.md (this file)
- test-dns.sh
```

## ✅ Final Checklist

### Before Deploying to Production

- [ ] All code changes committed
- [ ] Pushed to master branch
- [ ] GitHub Actions successful
- [ ] Coolify deployment complete
- [ ] Traefik/Nginx timeout configured
- [ ] Resources configured (4GB memory)
- [ ] Environment variables set
- [ ] DNS test passes (in production container)

### After Deployment

- [ ] Test small file (100MB)
- [ ] Test medium file (1GB)
- [ ] Test large file (3GB+)
- [ ] Monitor logs (no errors)
- [ ] Verify file in R2 bucket
- [ ] Check file size matches
- [ ] Test playback/download

## 🎉 Success Criteria

**You'll know it's working when:**

1. ✅ No `EAI_AGAIN` DNS errors in logs
2. ✅ You see retry attempt numbers > 1
3. ✅ Upload progress shows in logs
4. ✅ Upload completes successfully
5. ✅ File appears in R2 bucket
6. ✅ File size matches uploaded file
7. ✅ No 504 Gateway Timeout errors

## 🚀 Quick Start (TL;DR)

```bash
# LOCAL
docker-compose down && docker-compose up
./test-dns.sh
# Upload test file

# PRODUCTION
git add . && git commit -m "Fix: Large upload DNS config" && git push
# Wait for deploy (~15 min)
# Add Traefik labels in Coolify (see COOLIFY_PROXY_CONFIG.md)
# Upload test file
```

---

**Questions?** Check the detailed docs or open an issue!

**Ready to deploy?** Follow `DEPLOY_DNS_FIX.md`!

**Proxy issues?** Read `COOLIFY_PROXY_CONFIG.md`!

