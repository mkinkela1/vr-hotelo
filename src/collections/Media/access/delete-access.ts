import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getCollectionIDType } from '@/utils/get-collection-id-types'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
import { Access } from 'payload'

export const mediaDeleteAccess: Access = ({ req }) => {
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
    const hasAdminAccess = adminTenantAccessIDs.some((id) => id === selectedTenant)
    return hasAdminAccess
  }

  return false
}
