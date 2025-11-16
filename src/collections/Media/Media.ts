import { mediaCreateAccess } from '@/collections/Media/access/create-access'
import { mediaDeleteAccess } from '@/collections/Media/access/delete-access'
import { mediaReadAccess } from '@/collections/Media/access/read-access'
import { mediaUpdateAccess } from '@/collections/Media/access/update-access'
import { mediaCompleteHandler } from '@/collections/Media/endpoints/mediaCompleteHandler'
import { mediaPresignHandler } from '@/collections/Media/endpoints/mediaPresignHandler'
import { Thumbnail } from '@/payload-types'
import { customEndpointAuthorization } from '@/utils/custom-endpoint-authorization'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: mediaReadAccess,
    create: mediaCreateAccess,
    update: mediaUpdateAccess,
    delete: mediaDeleteAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'is360',
      type: 'checkbox',
      defaultValue: false,
      label: '360 Video',
      admin: {
        description: 'When enabled, this media will be a 360 video',
      },
    },
    {
      name: 'thumbnail',
      type: 'relationship',
      relationTo: 'thumbnails',
      hasMany: false,
      admin: {
        description: 'The thumbnail of the media',
      },
    },
    {
      name: 'thumbnail_renderer',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/collections/Media/components/ThumbnailRenderer',
        },
      },
    },
    {
      name: 'filename',
      type: 'text',
      required: true,
    },
    {
      name: 'r2Key',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'Public R2 URL to the file',
      },
    },
    {
      name: 'mimeType',
      type: 'text',
    },
    {
      name: 'filesize',
      type: 'number',
    },
    {
      name: 'width',
      type: 'number',
    },
    {
      name: 'height',
      type: 'number',
    },
    {
      name: 'focalX',
      type: 'number',
    },
    {
      name: 'focalY',
      type: 'number',
    },
    {
      type: 'ui',
      name: 'customUpload',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/collections/Media/components/R2Upload',
        },
      },
    },
  ],
  endpoints: [
    {
      path: '/current-tenant',
      method: 'get',
      handler: async (req) => {
        const { error, data, status } = await customEndpointAuthorization(req)

        if (error) {
          return Response.json({ error }, { status })
        }

        const currentTenantMedia = await req.payload.find({
          collection: 'media',
          where: {
            tenant: {
              equals: data?.tenant.id,
            },
          },
          pagination: false,
        })

        const response = currentTenantMedia.docs.map((media) => {
          const thumbnailData = media?.thumbnail as Thumbnail | null

          return {
            id: media.id,
            title: media.title,
            caption: media.caption,
            is360: media.is360,
            thumbnail: thumbnailData
              ? {
                  id: thumbnailData.id,
                  createdAt: thumbnailData.createdAt,
                  updatedAt: thumbnailData.updatedAt,
                  url: thumbnailData.url,
                  filename: thumbnailData.filename,
                  mimeType: thumbnailData.mimeType,
                  filesize: thumbnailData.filesize,
                  width: thumbnailData.width,
                  height: thumbnailData.height,
                  focalX: thumbnailData.focalX,
                  focalY: thumbnailData.focalY,
                }
              : null,
            filename: media.filename,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
            url: media.url,
            mimeType: media.mimeType,
            filesize: media.filesize,
            width: media.width,
            height: media.height,
            focalX: media.focalX,
            focalY: media.focalY,
          }
        })

        return Response.json(response)
      },
    },
    {
      path: '/presign',
      method: 'post',
      handler: mediaPresignHandler,
    },
    {
      path: '/complete',
      method: 'post',
      handler: mediaCompleteHandler,
    },
  ],
}
