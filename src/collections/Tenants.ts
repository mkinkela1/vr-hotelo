import { isSuperAdmin } from '@/access/isSuperAdmin'
import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    description:
      'Manage tenants for multi-tenant setup. Each tenant represents a separate organization or client.',
  },
  access: {
    read: ({ req }) => {
      // Allow read access for authenticated users
      return req.user ? true : false
    },
    create: ({ req }) => {
      // Only super admins can create tenants
      return isSuperAdmin(req.user)
    },
    update: ({ req }) => {
      // Only super admins can update tenants
      return isSuperAdmin(req.user)
    },
    delete: ({ req }) => {
      // Only super admins can delete tenants
      return isSuperAdmin(req.user)
    },
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Tenant Logo',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
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
      name: 'settings',
      type: 'group',
      label: 'Tenant Settings',
      fields: [
        {
          name: 'allowMediaUpload',
          type: 'checkbox',
          defaultValue: true,
          label: 'Allow Media Upload',
        },
        {
          name: 'maxMediaSize',
          type: 'number',
          defaultValue: 10,
          label: 'Max Media Size (MB)',
        },
        {
          name: 'allowedMediaTypes',
          type: 'select',
          hasMany: true,
          defaultValue: ['image/*', 'video/*', 'application/pdf'],
          options: [
            { label: 'Images', value: 'image/*' },
            { label: 'Videos', value: 'video/*' },
            { label: 'PDFs', value: 'application/pdf' },
            { label: 'Documents', value: 'application/*' },
          ],
          label: 'Allowed Media Types',
        },
      ],
    },
  ],
}
