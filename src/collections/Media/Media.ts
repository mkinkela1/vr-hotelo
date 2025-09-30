import { isSuperAdmin } from '@/access/isSuperAdmin'
import { mediaCreateAccess } from '@/collections/Media/access/create-access'
import { mediaDeleteAccess } from '@/collections/Media/access/delete-access'
import { mediaReadAccess } from '@/collections/Media/access/read-access'
import { mediaUpdateAccess } from '@/collections/Media/access/update-access'
import { getCollectionIDType } from '@/utils/get-collection-id-types'
import { defaultLocale, locales } from '@/utils/locales'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
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
    {
      name: 'tenant_uploaded',
      label: 'Tenant uploaded',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'The tenant that uploaded this file',
        condition: (data, siblingData, { user }) => {
          // Only show this field to super admins
          return Boolean(user && isSuperAdmin(user))
        },
      },
      access: {
        read: ({ req }) => {
          // Only super admins can read the tenant field
          return Boolean(req?.user && isSuperAdmin(req.user))
        },
        update: ({ req }) => {
          // Only super admins can update the tenant field
          return Boolean(req?.user && isSuperAdmin(req.user))
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
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Auto-assign tenant based on selected tenant in cookie
        if (!data.tenant_uploaded && req.user) {
          const selectedTenant = getTenantFromCookie(
            req.headers,
            getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
          )
          if (selectedTenant) {
            data.tenant_uploaded = selectedTenant
          }
        }
        return data
      },
    ],
  },
}
