import { isSuperAdmin } from '@/access/isSuperAdmin'
import { Tenant, User } from '@/payload-types'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { Access } from 'payload'

export const createAccess: Access<User> = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  if (!isSuperAdmin(req.user) && req.data?.roles?.includes('super-admin')) {
    return false
  }

  const adminTenantAccessIDs = getUserTenantIDs(req.user, 'tenant-admin')

  const requestedTenants: Tenant['id'][] =
    req.data?.tenants?.map((t: { tenant: Tenant['id'] }) => t.tenant) ?? []

  const hasAccessToAllRequestedTenants = requestedTenants.every((tenantID) =>
    adminTenantAccessIDs.includes(tenantID),
  )

  if (hasAccessToAllRequestedTenants) {
    return true
  }

  return false
}
