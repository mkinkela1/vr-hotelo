import { mediaCreateAccess } from '@/collections/Media/access/create-access'
import { mediaDeleteAccess } from '@/collections/Media/access/delete-access'
import { mediaReadAccess } from '@/collections/Media/access/read-access'
import { mediaUpdateAccess } from '@/collections/Media/access/update-access'
import { customEndpointAuthorization } from '@/utils/custom-endpoint-authorization'
import { defaultLocale, locales } from '@/utils/locales'
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
      name: 'alt',
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
      options: locales.map((locale) => ({
        label: locale.label,
        value: locale.code,
      })),
      defaultValue: defaultLocale,
      label: 'Locale',
      admin: {
        description: 'The locale of the media',
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
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    disableLocalStorage: true,
    mimeTypes: ['image/*', 'video/*', 'application/pdf', 'audio/*'],
  },
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

        return Response.json(currentTenantMedia)
      },
    },
  ],
}
