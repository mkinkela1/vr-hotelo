import { mediaCreateAccess } from '@/collections/Media/access/create-access'
import { mediaDeleteAccess } from '@/collections/Media/access/delete-access'
import { mediaReadAccess } from '@/collections/Media/access/read-access'
import { mediaUpdateAccess } from '@/collections/Media/access/update-access'
import { mediaCompleteHandler } from '@/collections/Media/endpoints/mediaCompleteHandler'
import { mediaPresignHandler } from '@/collections/Media/endpoints/mediaPresignHandler'
import { Thumbnail } from '@/payload-types'
import { customEndpointAuthorization } from '@/utils/custom-endpoint-authorization'
import { locales } from '@/utils/locales'
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
      name: 'locale',
      type: 'select',
      hasMany: true,
      options: locales.map((locale) => ({
        label: locale.label,
        value: locale.code,
      })),
      label: 'Locales',
      admin: {
        description: 'Select one or more locales for this media',
      },
    },
    {
      name: 'localizedTitles',
      type: 'array',
      label: 'Localized Titles',
      admin: {
        description: 'Title for each selected locale',
      },
      fields: [
        {
          name: 'locale',
          type: 'select',
          options: locales.map((locale) => ({
            label: locale.label,
            value: locale.code,
          })),
          required: true,
          admin: {
            description: 'Select the locale for this title',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Title in this locale',
          },
        },
      ],
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
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'r2Key',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'Public R2 URL to the file',
        readOnly: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'filesize',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'focalX',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'focalY',
      type: 'number',
      admin: {
        readOnly: true,
      },
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

          // Build localized_titles object from localizedTitles array
          const localizedTitles: Record<string, string> = {}
          const localizedTitlesData = (media as any).localizedTitles
          if (localizedTitlesData && Array.isArray(localizedTitlesData)) {
            localizedTitlesData.forEach((item: { locale: string; title: string }) => {
              if (item?.locale && item?.title) {
                const localeKey = item.locale || item.locale
                localizedTitles[localeKey] = item.title
              }
            })
          }

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
            locale: media.locale,
            localization: localizedTitles,
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
