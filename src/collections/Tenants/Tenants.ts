import { anyone } from '@/access/anyone'
import { isSuperAdmin, isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from '@/collections/Tenants/access/update-and-delete-access'
import { User } from '@/payload-types'
import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    description:
      'Manage tenants for multi-tenant setup. Each tenant represents a separate organization or client.',
    defaultColumns: ['name', 'domain', 'isActive'],
    hidden: ({ user }) => {
      if (!user) {
        return true
      }

      return !isSuperAdmin(user as unknown as User)
    },
  },
  access: {
    read: anyone,
    create: isSuperAdminAccess,
    update: updateAndDeleteAccess,
    delete: updateAndDeleteAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tenant Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Tenant Slug',
      admin: {
        description: 'Unique identifier for the tenant (used in URLs)',
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      label: 'Domain',
      admin: {
        description: 'Primary domain for this tenant',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Whether this tenant is active and accessible',
      },
    },
    {
      name: 'whitelabel',
      type: 'relationship',
      relationTo: 'whitelabels',
      label: 'Whitelabel',
      admin: {
        description: 'The whitelabel for this tenant',
      },
      hasMany: false,
      required: false,
    },
  ],
}
