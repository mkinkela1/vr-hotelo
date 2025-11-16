import { extractID } from '@/utils/extract-id'
import { PayloadHandler, PayloadRequest } from 'payload'

export const mediaCompleteHandler: PayloadHandler = async (req: PayloadRequest) => {
  const { key, filename, mimeType, filesize, width, height, title } = await (req as any).json()
  const { payload, user } = req
  const tenantId = user?.tenant ? extractID(user.tenant) : undefined

  if (!tenantId) {
    return Response.json({ error: 'Missing tenant ID' }, { status: 401 })
  }

  const record = await payload.create({
    collection: 'media',
    data: {
      filename,
      mimeType,
      filesize,
      width,
      height,
      title,
      url: `${process.env.S3_PUBLIC_BASE_URL}/${process.env.S3_BUCKET}/${key}`,
      tenant: tenantId,
      r2Key: key,
    } as any,
  })

  return Response.json(record)
}
