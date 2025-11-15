import { s3Storage } from '@payloadcms/storage-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import https from 'https'

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
    // Optimize for large file uploads with retry logic
    maxAttempts: 5, // Retry failed requests up to 5 times
    // Custom request handler with optimized settings for large files
    requestHandler: new NodeHttpHandler({
      requestTimeout: 1800000, // 30 minutes for large file uploads
      connectionTimeout: 60000, // 60 seconds for initial connection
      // Configure HTTPS agent with keepalive for stable connections
      httpsAgent: new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000, // Send keepalive packets every 30 seconds
        maxSockets: 50, // Allow up to 50 concurrent connections
        timeout: 60000, // Socket timeout
      }),
    }),
  },
  // Configure multipart upload for files larger than 100MB
  // This splits large files into manageable chunks
  acl: 'private', // or 'public-read' depending on your needs
})
