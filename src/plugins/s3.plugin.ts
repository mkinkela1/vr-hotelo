import { s3Storage } from '@payloadcms/storage-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import dns from 'dns'
import https from 'https'

// Configure DNS to be more aggressive with retries and use multiple resolvers
dns.setDefaultResultOrder('ipv4first')
dns.setServers([
  '1.1.1.1', // Cloudflare DNS (primary)
  '1.0.0.1', // Cloudflare DNS (secondary)
  '8.8.8.8', // Google DNS (fallback)
  '8.8.4.4', // Google DNS (fallback)
])

export const s3Plugin = s3Storage({
  collections: {
    media: true,
    whitelabels: true,
    thumbnails: true,
  },
  bucket: process.env.S3_BUCKET || '',
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    // Aggressive retry configuration for network and DNS issues
    maxAttempts: 10, // Increased from 5 to 10 for DNS issues
    retryMode: 'adaptive', // Adaptive retry mode handles transient errors better
    // Custom request handler with optimized settings for large files
    requestHandler: new NodeHttpHandler({
      requestTimeout: 1800000, // 30 minutes for large file uploads
      connectionTimeout: 120000, // Increased to 120 seconds for DNS resolution
      // Configure HTTPS agent with keepalive for stable connections
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000, // Send keepalive packets every 30 seconds
        maxSockets: 50, // Allow up to 50 concurrent connections
        timeout: 120000, // Increased socket timeout to 120 seconds
        // DNS lookup settings
        lookup: (hostname, options, callback) => {
          // Custom DNS lookup with retry logic
          const doLookup = (attemptNum: number) => {
            dns.lookup(hostname, options, (err, address, family) => {
              if (err && attemptNum < 3) {
                // Retry DNS lookup up to 3 times with delay
                console.log(
                  `DNS lookup failed for ${hostname}, attempt ${attemptNum + 1}/3, retrying...`,
                )
                setTimeout(() => doLookup(attemptNum + 1), 1000 * attemptNum) // Exponential backoff
              } else {
                callback(err, address, family)
              }
            })
          }
          doLookup(0)
        },
      }),
    }),
  },
  // Configure multipart upload for files larger than 100MB
  // This splits large files into manageable chunks
  acl: 'private', // or 'public-read' depending on your needs
})
