# Large File Upload Configuration (3+ GB)

This document explains the configuration changes made to support uploading large files (3+ GB) to Cloudflare R2.

## Problem Summary

When uploading large files (3+ GB), the following errors were occurring:

1. **DNS Resolution Failures** (`EAI_AGAIN getaddrinfo`) - DNS lookup timeouts
2. **Connection Aborts** (`ECONNRESET`, `aborted`) - Network connection failures
3. **Upload Timeouts** - Files timing out during upload process

## Solutions Implemented

### 1. S3 Plugin Configuration (`src/plugins/s3.plugin.ts`)

The S3 plugin has been enhanced with:

#### a. Retry Logic
- **maxAttempts: 5** - Automatically retries failed requests up to 5 times
- Handles transient network errors like DNS resolution failures

#### b. Extended Timeouts
- **requestTimeout: 1,800,000ms (30 minutes)** - Allows large files to complete upload
- **connectionTimeout: 60,000ms (60 seconds)** - More time for initial connection

#### c. HTTP Connection Management
- **keepAlive: true** - Maintains persistent connections
- **keepAliveMsecs: 30,000ms** - Sends keepalive packets every 30 seconds
- **maxSockets: 50** - Allows up to 50 concurrent connections

#### d. Custom HTTP Handler
Uses `@smithy/node-http-handler` with optimized HTTPS agent for stable, long-running uploads.

### 2. Next.js Configuration (`next.config.mjs`)

Added experimental server actions configuration:

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '5gb', // Allows uploads up to 5GB
  },
}
```

This ensures Next.js can handle the large request payloads.

### 3. API Route Configuration (`src/app/(payload)/api/[...slug]/route.ts`)

Added route segment configuration:

```typescript
export const maxDuration = 300 // 5 minutes function timeout
```

This prevents the API route from timing out during large uploads.

### 4. Package Dependencies

Installed `@smithy/node-http-handler` for optimized HTTP handling with AWS SDK v3.

## How It Works

### Multipart Upload

The AWS SDK automatically uses **multipart upload** for large files:
- Files are split into smaller chunks (default: 5MB per part)
- Each part is uploaded independently
- Parts can be retried individually if they fail
- Final assembly happens on the R2 side

### Connection Stability

The HTTP keepalive configuration ensures:
- Connections stay alive during long uploads
- Reduces connection establishment overhead
- Prevents connection resets during idle periods

### Error Recovery

With retry logic:
- Transient DNS failures are automatically retried
- Network hiccups don't cause complete upload failure
- Exponential backoff prevents overwhelming the server

## Testing Large File Uploads

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Upload a large file (3+ GB) through the Payload admin interface:**
   - Navigate to Media collection
   - Click "Upload"
   - Select your large video file
   - Monitor the upload progress

3. **Watch the logs for:**
   - No DNS resolution errors
   - No connection timeouts
   - Successful multipart upload completion

## Best Practices

### For Files 100MB - 1GB
- Default settings work well
- Uploads typically complete in 1-5 minutes

### For Files 1GB - 3GB
- Allow 5-15 minutes for upload
- Monitor network stability

### For Files 3GB+
- Allow 15-30 minutes for upload
- Ensure stable network connection
- Consider uploading during off-peak hours
- Monitor server memory usage

## Monitoring Upload Progress

You can monitor uploads in several ways:

1. **Browser Developer Tools:**
   - Network tab shows upload progress
   - Console shows any JavaScript errors

2. **Server Logs:**
   - Docker logs show S3 upload events
   - Look for "Upload timeout" or "getaddrinfo" errors

3. **R2 Dashboard:**
   - Check Cloudflare R2 dashboard for uploaded objects
   - Verify file sizes match expected values

## Troubleshooting

### DNS Resolution Errors Still Occurring

If you still see `EAI_AGAIN` errors:

1. **Check DNS configuration:**
   ```bash
   nslookup vr-hotelo-5f7ad06b-a5ff-4924-835b-5e964a9beb0b.643af51677eb9db5c70ccc5452aa4400.r2.cloudflarestorage.com
   ```

2. **Verify network stability:**
   - Use a wired connection instead of WiFi
   - Check for firewall/proxy issues

3. **Increase retry attempts:**
   In `src/plugins/s3.plugin.ts`, increase `maxAttempts` to 10:
   ```typescript
   maxAttempts: 10,
   ```

### Connection Timeouts

If uploads still timeout:

1. **Increase request timeout:**
   In `src/plugins/s3.plugin.ts`, increase to 60 minutes:
   ```typescript
   requestTimeout: 3600000, // 60 minutes
   ```

2. **Check Docker memory limits:**
   Ensure your Docker container has sufficient memory:
   ```yaml
   # docker-compose.yml
   services:
     app:
       mem_limit: 4g
   ```

### Memory Issues

For very large files:

1. **Increase Node.js memory:**
   Already configured in package.json scripts:
   ```json
   "build": "cross-env NODE_OPTIONS=\"--max-old-space-size=8000\" next build"
   ```

2. **Monitor memory usage:**
   ```bash
   docker stats
   ```

### Upload Aborted Errors

If uploads are being aborted:

1. **Check client timeout settings:**
   - Browser may have its own timeout
   - Try different browsers (Chrome, Firefox)

2. **Verify proxy/load balancer settings:**
   - If behind a proxy, ensure it allows long-running requests
   - Configure proxy timeouts appropriately

## Environment Variables

Ensure these are properly configured in your `.env` file:

```bash
# R2 Configuration
S3_BUCKET=your-bucket-name
S3_REGION=auto  # For Cloudflare R2
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## Additional Optimizations

### For Production Deployments

1. **Use CDN for delivery:**
   - Configure R2 public bucket with Cloudflare CDN
   - Reduces direct load on R2 bucket

2. **Implement chunked uploads in frontend:**
   - Consider using resumable upload library
   - Allows pausing/resuming uploads

3. **Add upload progress tracking:**
   - Implement WebSocket or SSE for real-time progress
   - Show percentage and estimated time remaining

4. **Queue large uploads:**
   - Use background job queue for processing
   - Prevents blocking main application thread

### Security Considerations

1. **File size limits:**
   - Current limit: 5GB
   - Adjust based on your needs and infrastructure

2. **File type validation:**
   - Already configured in Media collection:
   ```typescript
   mimeTypes: ['image/*', 'video/*', 'application/pdf', 'audio/*']
   ```

3. **Access control:**
   - S3 ACL set to 'private' by default
   - Use signed URLs for temporary access

## Performance Metrics

Expected upload times (with stable 100 Mbps connection):

| File Size | Expected Time | Actual Time May Vary |
|-----------|---------------|---------------------|
| 1 GB      | ~2 minutes    | ±30 seconds         |
| 2 GB      | ~4 minutes    | ±1 minute           |
| 3 GB      | ~6 minutes    | ±2 minutes          |
| 5 GB      | ~10 minutes   | ±3 minutes          |

*Note: Actual times depend on network speed, server load, and R2 performance.*

## Support

If you continue experiencing issues:

1. Check Cloudflare R2 status page
2. Verify network connectivity to R2 endpoints
3. Review Cloudflare R2 rate limits and quotas
4. Consider contacting Cloudflare support for R2-specific issues

## Changelog

### 2025-11-15
- ✅ Added retry logic (5 attempts)
- ✅ Increased timeouts (30 minutes request, 60 seconds connection)
- ✅ Configured HTTP keepalive
- ✅ Added Next.js body size limit (5GB)
- ✅ Installed @smithy/node-http-handler
- ✅ Extended API route duration (5 minutes)
- ✅ Enabled multipart upload support

