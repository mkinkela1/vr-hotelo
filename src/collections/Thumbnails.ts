import { Tenant } from '@/payload-types'
import { customEndpointAuthorization } from '@/utils/custom-endpoint-authorization'
import { extractID } from '@/utils/extract-id'
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
  endpoints: [
    {
      path: '/:id/v2',
      method: 'get',
      handler: async (req) => {
        const { id } = req.routeParams as { id: string }
        const { payload } = req

        const { error, data, status } = await customEndpointAuthorization(req, false)

        if (error) {
          return Response.json({ error }, { status })
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

        const thumbnailTenant = extractID(thumbnail.tenant as Tenant)
        const currentTenantID = extractID(data?.tenant as Tenant)

        if (thumbnailTenant !== currentTenantID) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return Response.json(thumbnail)
      },
    },
  ],
}
