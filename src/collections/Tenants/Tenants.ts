import { authenticated, authenticatedFieldAccess } from '@/access/isAuthenticated'
import { isSuperAdmin, isSuperAdminAccess, isSuperAdminFieldAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from '@/collections/Tenants/access/update-and-delete-access'
import { Tenant, User } from '@/payload-types'
import { customEndpointAuthorization } from '@/utils/custom-endpoint-authorization'
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
    read: authenticated,
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
    {
      name: 'aiContent',
      type: 'group',
      label: 'AI Content',
      admin: {
        description: 'The AI knowledge for each language',
      },
      fields: [
        {
          name: 'hr',
          type: 'textarea',
          label: 'Hrvatski',
        },
        {
          name: 'en',
          type: 'textarea',
          label: 'English',
        },
        {
          name: 'fr',
          type: 'textarea',
          label: 'French',
        },
        {
          name: 'de',
          type: 'textarea',
          label: 'German',
        },
        {
          name: 'it',
          type: 'textarea',
          label: 'Italian',
        },
      ],
    },
    {
      name: 'ordersEmail',
      type: 'email',
      label: 'Orders Email',
      admin: {
        description: 'The email address for orders',
      },
    },
    {
      name: 'licenseExpiration',
      type: 'date',
      label: 'License Expiration',
      admin: {
        description: 'The expiration date of the license',
        position: 'sidebar',
      },
      access: {
        create: isSuperAdminFieldAccess,
        update: isSuperAdminFieldAccess,
        read: authenticatedFieldAccess,
      },
    },
  ],
  endpoints: [
    {
      path: '/current-tenant',
      method: 'get',
      handler: async (req) => {
        const { error, data, status } = await customEndpointAuthorization(req)

        if (error) {
          return Response.json({ error }, { status })
        }

        const tenantData = data?.tenant as Tenant

        return Response.json({
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          domain: tenantData.domain,
          isActive: tenantData.isActive,
          aiContent: tenantData.aiContent,
          ordersEmail: tenantData.ordersEmail,
          licenseExpiration: tenantData.licenseExpiration,
          updatedAt: tenantData.updatedAt,
          createdAt: tenantData.createdAt,
        })
      },
    },
  ],
}
