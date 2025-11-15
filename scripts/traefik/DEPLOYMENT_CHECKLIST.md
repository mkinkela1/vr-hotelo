# 3GB+ File Upload Deployment Checklist

## ✅ Completed

1. **Application Code Updates**
   - ✅ `src/plugins/s3.plugin.ts` - Updated to 60-minute timeouts
   - ✅ `src/app/(payload)/api/[...slug]/route.ts` - Updated to 3600s max duration
   - ✅ Both files now support 3GB+ file uploads

2. **Traefik Configuration Generator**
   - ✅ Created automated script at `scripts/traefik/generate-config.py`
   - ✅ Script reads from `subdomains.txt` file
   - ✅ Generates complete Traefik config with 60-minute timeouts
   - ✅ Includes 5GB request body size limit
   - ✅ Added documentation and quick-start guide

## 🔧 Required Actions

### 1. Update Traefik Configuration in Coolify

**Current Status:** The generated configuration is ready but NOT yet deployed to Coolify.

**Steps:**

```bash
# 1. Navigate to the traefik scripts directory
cd scripts/traefik

# 2. Generate the configuration
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s

# 3. Open the generated file
cat traefik-config.txt

# 4. Copy ALL contents
```

Then in Coolify:
1. Go to your application
2. Navigate to **Settings** → **Custom Labels**
3. **Replace** all existing labels with the new configuration
4. Click **Save**

### 2. Restart Your Application

After updating the Traefik labels:
1. In Coolify, click **Restart** on your application
2. Wait for the deployment to complete
3. Verify logs show no errors

### 3. Test the Upload

Try uploading one of your 3GB+ files:
- The timeout should now be 60 minutes instead of 10 minutes
- Maximum file size is 5GB
- The upload should complete successfully

## 📊 Timeout Configuration Summary

| Component | Old Value | New Value | Purpose |
|-----------|-----------|-----------|---------|
| Traefik `responseHeaderTimeout` | Not set (10min default) | 3600s (60min) | Proxy timeout |
| S3 Plugin `requestTimeout` | 1800000ms (30min) | 3600000ms (60min) | S3 upload timeout |
| S3 Plugin `connectionTimeout` | 120000ms (2min) | 180000ms (3min) | Connection setup |
| S3 Plugin `timeout` | 120000ms (2min) | 3600000ms (60min) | Socket timeout |
| S3 Plugin `keepAliveMsecs` | 30000ms (30s) | 15000ms (15s) | Keepalive frequency |
| API Route `maxDuration` | 1800s (30min) | 3600s (60min) | Next.js route timeout |
| Traefik `maxRequestBodyBytes` | Not set | 5368709120 (5GB) | Max upload size |

## 🔄 Managing Subdomains in the Future

### Adding a New Subdomain

```bash
# 1. Edit the subdomains file
nano scripts/traefik/subdomains.txt

# 2. Add your new subdomain (one per line)
# Example: new-hotel-property

# 3. Regenerate configuration
cd scripts/traefik
python3 generate-config.py fwkw8g8gww00g4ggg0w8gg4s

# 4. Copy traefik-config.txt to Coolify (as above)

# 5. Restart application
```

### Removing a Subdomain

Same process as adding - just remove the line from `subdomains.txt` and regenerate.

## 🐛 Troubleshooting

### Upload Still Timing Out

**Check:**
1. Did you update Traefik labels in Coolify?
2. Did you restart the application?
3. Verify the config with: `grep "responseHeaderTimeout" traefik-config.txt`
4. Should show: `loadbalancer.responseHeaderTimeout=3600s`

### Upload Size Limit Exceeded

**Check:**
1. File is under 5GB
2. Traefik config includes: `maxRequestBodyBytes=5368709120`
3. Next.js config has: `bodySizeLimit: '5gb'` (in `next.config.mjs`)

### DNS/Connection Errors

**Check:**
1. DNS is configured correctly for your subdomain
2. Let's Encrypt certificate was issued (check Coolify logs)
3. Wait a few minutes after adding a new subdomain

### Application Errors After Update

**Check:**
1. Review Coolify application logs
2. Verify Traefik configuration syntax (no typos)
3. Ensure all old labels were replaced (not merged)

## 📝 Files Modified

```
✅ src/plugins/s3.plugin.ts - Increased timeouts
✅ src/app/(payload)/api/[...slug]/route.ts - Increased maxDuration
📁 scripts/traefik/ - New directory created
  ├── generate-config.py - Configuration generator
  ├── subdomains.txt - Subdomain list (editable)
  ├── traefik-config.txt - Generated config (auto-created)
  ├── README.md - Full documentation
  ├── QUICKSTART.md - Quick reference
  ├── DEPLOYMENT_CHECKLIST.md - This file
  └── .gitignore - Excludes generated config
```

## 🚀 Expected Results

After completing all steps:

✅ Files up to 5GB can be uploaded
✅ Upload timeout is 60 minutes (sufficient for 3GB+ files)
✅ Automatic retry on network errors
✅ All subdomains have same upload capabilities
✅ HTTPS configured automatically via Let's Encrypt
✅ GZIP compression enabled

## ⚠️ Important Notes

1. **Payload Auto-Generated File Warning:**
   - `src/app/(payload)/api/[...slug]/route.ts` has a comment saying it's auto-generated
   - If Payload regenerates this file, you'll need to re-add the `maxDuration` line

2. **Upload Speed Calculation:**
   - Your upload speed: ~3.2 MB/s (based on 1.9GB in 10 minutes)
   - 3GB file will take ~16 minutes to upload
   - 5GB file will take ~26 minutes to upload
   - 60-minute timeout provides plenty of headroom

3. **Resource Considerations:**
   - Large uploads will use more memory
   - Monitor server resources during uploads
   - Consider increasing server RAM if needed

## 📞 Next Steps

1. ✅ Review this checklist
2. 🔧 Update Traefik configuration in Coolify (see above)
3. 🔄 Restart the application
4. 🧪 Test with 3GB+ file upload
5. 📊 Monitor logs during upload
6. ✅ Verify successful upload

---

**Generated:** Using scripts/traefik/generate-config.py
**Last Updated:** Now
**Status:** Ready to deploy to Coolify

