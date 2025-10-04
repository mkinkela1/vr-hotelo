import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { Access } from 'payload'

export const mediaReadAccess: Access = async ({ req }) => {
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
      tenant: {
        in: allTenantAccessIDs,
      },
    }
  }

  return false
}
