import { isSuperAdmin } from '@/access/isSuperAdmin'
import { setCookieBasedOnDomain } from '@/collections/Users/hooks/setCookieBasedOnDomain'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import type { CollectionConfig } from 'payload'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {
    read: ({ req }) => {
      // Users can read their own tenant associations
      return req.user ? true : false
    },
    create: ({ req }) => {
      // Only super admins can create tenant associations
      return isSuperAdmin(req.user)
    },
    update: ({ req }) => {
      // Only super admins can update tenant associations
      return isSuperAdmin(req.user)
    },
  },
  tenantFieldAccess: {
    read: ({ req }) => {
      // Users can read their own tenant associations
      return req.user ? true : false
    },
    create: ({ req }) => {
      // Only super admins can create tenant associations
      return isSuperAdmin(req.user)
    },
    update: ({ req }) => {
      // Only super admins can update tenant associations
      return isSuperAdmin(req.user)
    },
  },
  rowFields: [
    {
      name: 'roles',
      type: 'select',
      defaultValue: ['tenant-viewer'],
      hasMany: true,
      options: ['tenant-admin', 'tenant-viewer'],
      required: true,
    },
  ],
})

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      admin: {
        position: 'sidebar',
      },
      name: 'roles',
      type: 'select',
      defaultValue: ['user'],
      hasMany: true,
      options: ['super-admin', 'user'],
      access: {
        update: ({ req }) => {
          return isSuperAdmin(req.user)
        },
      },
    },
    {
      ...defaultTenantArrayField,
      admin: {
        ...(defaultTenantArrayField?.admin || {}),
        position: 'sidebar',
      },
    },
  ],

  hooks: {
    afterLogin: [setCookieBasedOnDomain],
  },
}
