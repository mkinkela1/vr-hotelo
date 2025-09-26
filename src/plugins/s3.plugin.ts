import { s3Storage } from '@payloadcms/storage-s3'

export const s3Plugin = s3Storage({
  collections: {
    media: true,
    whitelabels: true,
  },
  bucket: process.env.S3_BUCKET || '',
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
  },
})
