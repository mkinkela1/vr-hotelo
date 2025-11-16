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
    // media: true, // Disabled - using custom R2 upload endpoints instead
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
    maxAttempts: 10,
    retryMode: 'adaptive',
    // Custom request handler with optimized settings for large files
    requestHandler: new NodeHttpHandler({
      requestTimeout: 3600000, // INCREASED: 60 minutes for 3GB+ files
      connectionTimeout: 180000, // INCREASED: 3 minutes for DNS resolution
      // Configure HTTPS agent with keepalive for stable connections
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 15000, // DECREASED: Send keepalive packets every 15 seconds (more frequent)
        maxSockets: 50,
        timeout: 3600000, // INCREASED: 60 minutes socket timeout
        // DNS lookup settings
        lookup: (hostname, options, callback) => {
          // Custom DNS lookup with retry logic
          const doLookup = (attemptNum: number) => {
            dns.lookup(hostname, options, (err, address, family) => {
              if (err && attemptNum < 3) {
                console.log(
                  `DNS lookup failed for ${hostname}, attempt ${attemptNum + 1}/3, retrying...`,
                )
                setTimeout(() => doLookup(attemptNum + 1), 1000 * attemptNum)
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
  acl: 'private',
})
