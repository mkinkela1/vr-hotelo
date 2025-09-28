import { isSuperAdmin } from '@/access/isSuperAdmin'
import { User } from '@/payload-types'
import type { Access, CollectionConfig } from 'payload'

// Access control for Whitelabels collection
const whitelabelsReadAccess: Access = ({ req }) => {
  // Anyone can read whitelabels (public access)
  return true
}

const whitelabelsCreateAccess: Access = ({ req }) => {
  // Only super admins can create whitelabels
  if (!req?.user) {
    return false
  }

  return isSuperAdmin(req.user)
}

const whitelabelsUpdateAccess: Access = ({ req }) => {
  // Only super admins can update whitelabels
  if (!req?.user) {
    return false
  }

  return isSuperAdmin(req.user)
}

const whitelabelsDeleteAccess: Access = ({ req }) => {
  // Only super admins can delete whitelabels
  if (!req?.user) {
    return false
  }

  return isSuperAdmin(req.user)
}

export const Whitelabels: CollectionConfig = {
  slug: 'whitelabels',
  access: {
    read: whitelabelsReadAccess,
    create: whitelabelsCreateAccess,
    update: whitelabelsUpdateAccess,
    delete: whitelabelsDeleteAccess,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      label: 'Tenant',
      admin: {
        description: 'The tenant this whitelabel belongs to',
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
    useAsTitle: 'tenant',
    hidden: ({ user }) => {
      if (!user) {
        return true
      }

      return !isSuperAdmin(user as unknown as User)
    },
  },
}
