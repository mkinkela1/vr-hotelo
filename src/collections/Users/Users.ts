import { isSuperAdmin } from '@/access/isSuperAdmin'
import { createAccess } from '@/collections/Users/access/create-access'
import { deleteAccess } from '@/collections/Users/access/delete-access'
import { canListUsers } from '@/collections/Users/access/list-access'
import { readAccess } from '@/collections/Users/access/read-access'
import { updateAccess } from '@/collections/Users/access/update-access'
import { setCookieBasedOnDomain } from '@/collections/Users/hooks/setCookieBasedOnDomain'
import { validateTenantAccess } from '@/collections/Users/hooks/validate-tenant-access'
import config from '@payload-config'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import { extractJWT, getPayload, type CollectionConfig } from 'payload'
import { extractID } from 'payload/shared'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {},
  tenantFieldAccess: {},
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
    hidden: ({ user }) => !canListUsers(user),
  },
  auth: {
    tokenExpiration: 30 * 365 * 24 * 60 * 60,
    strategies: [
      {
        name: 'bearer-token',
        authenticate: async ({ headers }) => {
          const payload = await getPayload({ config })
          const decoded = extractJWT({ headers, payload })
          if (!decoded) {
            return { user: null }
          }

          try {
            const id = extractID(decoded)

            const user = await payload.findByID({
              collection: 'users',
              id,
            })

            return { user: { ...user, collection: 'users' } }
          } catch (error) {
            return { user: null }
          }
        },
      },
    ],
  },
  access: {
    create: createAccess,
    read: readAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
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
    beforeLogin: [validateTenantAccess],
    afterLogin: [setCookieBasedOnDomain],
  },
}
