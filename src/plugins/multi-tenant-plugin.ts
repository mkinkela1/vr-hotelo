import { isSuperAdmin } from '@/access/isSuperAdmin'
import { multiTenantPlugin as multiTenantPluginBase } from '@payloadcms/plugin-multi-tenant'
import { getUserTenantIDs } from '@payloadcms/plugin-multi-tenant/utilities'
import { Config } from 'payload'

export const multiTenantPlugin = multiTenantPluginBase<Config>({
  collections: {
    users: {
      useTenantAccess: true,
    },
    media: {
      useTenantAccess: true,
      useBaseListFilter: false, // Disable this to prevent delete operation issues
    },
  },
  tenantField: {
    access: {
      read: () => true,
      create: ({ req }) => isSuperAdmin(req.user),
      update: ({ req }) => {
        if (isSuperAdmin(req.user)) {
          return true
        }
        return getUserTenantIDs(req.user).length > 0
      },
    },
  },
  tenantsArrayField: {
    includeDefaultField: false,
  },
  userHasAccessToAllTenants: (user) => isSuperAdmin(user),
  // Enable debug mode to see tenant fields in admin
  debug: process.env.NODE_ENV === 'development',
})
