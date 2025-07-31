import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/isAuthenticated'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
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
  ],
  upload: {
    staticDir: '../../public/media',
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
}
