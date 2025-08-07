import { isSuperAdmin } from '@/access/isSuperAdmin'
import { User } from '@/payload-types'
import { ClientUser } from 'payload'

export const canListUsers = (user: ClientUser): boolean => {
  if (!user) {
    return false
  }

  if (isSuperAdmin(user as unknown as User)) {
    return true
  }

  const hasTenantAdminRole =
    user.tenants?.some(({ roles }: { roles: string[] }) => roles.includes('tenant-admin')) || false

  return hasTenantAdminRole
}
