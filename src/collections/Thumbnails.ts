import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getCollectionIDType } from '@/utils/get-collection-id-types'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import { CollectionConfig } from 'payload'

export const Thumbnails: CollectionConfig = {
  slug: 'thumbnails',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        description: 'The title of the thumbnail',
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
          return Boolean(user && isSuperAdmin(user))
        },
      },
      access: {
        read: ({ req }) => {
          return Boolean(req?.user && isSuperAdmin(req.user))
        },
        update: ({ req }) => {
          return Boolean(req?.user && isSuperAdmin(req.user))
        },
      },
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    disableLocalStorage: true,
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
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
  endpoints: [
    {
      path: '/:id/v2',
      method: 'get',
      handler: async (req) => {
        const { id } = req.routeParams as { id: string }
        const { payload, user } = req

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!id) {
          return Response.json({ error: 'Thumbnail ID is required' }, { status: 400 })
        }

        const thumbnail = await payload.findByID({
          collection: 'thumbnails',
          id,
        })

        if (!thumbnail) {
          return Response.json({ error: 'Thumbnail not found' }, { status: 404 })
        }

        if (thumbnail.tenant_uploaded !== user.tenant && !isSuperAdmin(user)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return Response.json(thumbnail)
      },
    },
  ],
}
