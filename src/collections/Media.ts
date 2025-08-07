import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getCollectionIDType } from '@/utils/get-collection-id-types'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import type { Access, CollectionConfig } from 'payload'

// Access control for Media collection
const mediaReadAccess: Access = async ({ req }) => {
  if (!req?.user) {
    return false
  }

  const superAdmin = isSuperAdmin(req.user)
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')
  const viewerTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-viewer')

  if (superAdmin) {
    return true
  }

  const allTenantAccessIDs = [...adminTenantAccessIDs, ...viewerTenantAccessIDs]
  if (allTenantAccessIDs.length > 0) {
    return {
      tenant_uploaded: {
        in: allTenantAccessIDs,
      },
    }
  }

  return false
}

const mediaCreateAccess: Access = ({ req }) => {
  if (!req?.user) {
    return false
  }

  const superAdmin = isSuperAdmin(req.user)
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (superAdmin) {
    return true
  }

  if (selectedTenant) {
    // Only tenant-admin can create media for their tenant
    const hasAdminAccess = adminTenantAccessIDs.some((id) => id === selectedTenant)
    return hasAdminAccess
  }

  return false
}

const mediaUpdateAccess: Access = ({ req }) => {
  if (!req?.user) {
    return false
  }

  const superAdmin = isSuperAdmin(req.user)
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (superAdmin) {
    return true
  }

  if (selectedTenant) {
    // Only tenant-admin can update media for their tenant
    const hasAdminAccess = adminTenantAccessIDs.some((id) => id === selectedTenant)
    return hasAdminAccess
  }

  return false
}

const mediaDeleteAccess: Access = ({ req }) => {
  if (!req?.user) {
    return false
  }

  const superAdmin = isSuperAdmin(req.user)
  const selectedTenant = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload: req.payload, collectionSlug: 'tenants' }),
  )
  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  if (superAdmin) {
    return true
  }

  if (selectedTenant) {
    // Only tenant-admin can delete media for their tenant
    const hasAdminAccess = adminTenantAccessIDs.some((id) => id === selectedTenant)
    return hasAdminAccess
  }

  return false
}

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
    staticDir: '../../public/media',
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
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
