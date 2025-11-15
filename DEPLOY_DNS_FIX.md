# Deploy DNS Fix to Production - Quick Guide

## What Was Fixed

✅ **DNS resolution failures** causing `EAI_AGAIN` errors
✅ **Connection timeouts** for large file uploads
✅ **Retry logic** with exponential backoff
✅ **Extended timeouts** (30 minutes for uploads)

## Files Changed

- `src/plugins/s3.plugin.ts` - DNS config + retry logic
- `next.config.mjs` - 5GB body size limit
- `src/app/(payload)/api/[...slug]/route.ts` - 30 min timeout
- `docker-compose.yml` - DNS for local development
- `package.json` - Added `@smithy/node-http-handler`
- Documentation files (won't affect production)

## Deploy to Production (Coolify)

### Step 1: Review Changes

```bash
# Check what will be committed
git status
git diff
```

### Step 2: Commit Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix: DNS configuration for large file uploads to R2

- Add custom DNS servers (Cloudflare 1.1.1.1, Google 8.8.8.8)
- Implement DNS retry logic with exponential backoff (3 attempts)
- Increase S3 operation retries to 10 (was 5)
- Use adaptive retry mode for better transient error handling
- Extend connection timeout to 120 seconds (was 60)
- Extend socket timeout to 120 seconds (was 60)
- Add Next.js 5GB body size limit
- Extend API route timeout to 30 minutes
- Install @smithy/node-http-handler for optimized HTTP handling

Fixes #issue-number (if you have one)

This addresses EAI_AGAIN DNS resolution errors when uploading
large files (3+ GB) to Cloudflare R2 in production."
```

### Step 3: Push to Master

```bash
# This will trigger your GitHub Actions workflow
git push origin master
```

### Step 4: Monitor Deployment

1. **GitHub Actions** (https://github.com/your-repo/actions)
   - Watch the "Deploy" workflow
   - Ensure Docker build succeeds
   - Verify push to Docker Hub
   - Confirm Coolify deployment trigger

2. **Coolify Dashboard**
   - Watch deployment progress
   - Wait for container restart
   - Check logs for startup errors

### Step 5: Test in Production

1. **Navigate to production Payload admin**
   ```
   https://your-production-url.com/admin
   ```

2. **Try uploading a large file (3+ GB)**
   - Go to Media collection
   - Click Upload
   - Select large video file
   - Monitor upload progress

3. **Check logs in Coolify**
   - Look for DNS retry messages (good sign!)
   - Verify no `EAI_AGAIN` errors
   - Confirm upload completes

## Expected Results

### ✅ Success Indicators

In production logs:
```
DNS lookup failed for ..., attempt 1/3, retrying...
DNS resolution successful
[multipart upload progress...]
Upload completed successfully
```

### ❌ If Still Failing

See `PRODUCTION_DEPLOYMENT_DNS.md` for troubleshooting.

Common issues:
1. **Coolify reverse proxy timeout** - Need to increase Nginx/Traefik timeout
2. **Firewall blocking DNS** - Ensure 1.1.1.1 and 8.8.8.8 are accessible
3. **Insufficient resources** - Check memory (need 4GB+)

## Rollback (If Needed)

If the deployment causes issues:

```bash
# Revert the commit
git revert HEAD

# Push to trigger rollback deployment
git push origin master
```

Or in Coolify, manually deploy a previous Docker image tag.

## Timeline

- **Commit & Push:** ~1 minute
- **GitHub Actions Build:** ~5-10 minutes
- **Coolify Deployment:** ~2-5 minutes
- **Total:** ~10-15 minutes until production is updated

Then test your large file upload!

## Quick Commands

```bash
# One-liner to commit and push (if you're confident)
git add . && git commit -m "Fix: DNS configuration for large R2 uploads" && git push origin master

# Watch GitHub Actions (if you have gh CLI)
gh run watch

# View Coolify logs (if you have SSH access)
ssh your-server "docker logs -f coolify-container-name"
```

## Post-Deployment Checklist

- [ ] GitHub Actions workflow completed successfully
- [ ] Coolify shows deployment succeeded
- [ ] Application is running (check health endpoint)
- [ ] Large file upload test (3+ GB) works
- [ ] No DNS errors in logs
- [ ] Upload completes in reasonable time (~6-10 min for 3GB)

## Important Notes

1. **The DNS fixes are in your application code** - They will work automatically once deployed
2. **No infrastructure changes needed** - Unless you still see DNS errors
3. **Local and production use same code** - The s3.plugin.ts DNS settings work everywhere
4. **Monitor first few uploads** - Check logs to ensure DNS retries are working

## Need Help During Deployment?

- Check `PRODUCTION_DEPLOYMENT_DNS.md` for detailed troubleshooting
- Check `LARGE_FILE_UPLOAD.md` for comprehensive documentation
- Run `./test-dns.sh` locally to verify DNS before deploying

---

**Ready to deploy?** Run the commands above and your production environment will have the DNS fixes! 🚀

