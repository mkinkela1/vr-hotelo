import { extractID } from '@/utils/extract-id'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { PayloadHandler, PayloadRequest } from 'payload'

export const mediaPresignHandler: PayloadHandler = async (req: PayloadRequest) => {
  const { filename, mimeType } = await (req as any).json()
  const { user } = req
  const tenantId = user?.tenant ? extractID(user.tenant) : undefined

  if (!tenantId) {
    return Response.json({ error: 'Missing tenant ID' }, { status: 401 })
  }

  const key = `tenants/${tenantId}/${Date.now()}-${filename}`

  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: mimeType,
  })

  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 30, // 30 minutes
  })

  return Response.json({
    uploadUrl: signedUrl,
    key,
    publicUrl: `${process.env.S3_PUBLIC_BASE_URL}/${process.env.S3_BUCKET}/${key}`,
  })
}
