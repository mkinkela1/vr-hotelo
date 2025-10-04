import { User } from '@/payload-types'
import { Access, FieldAccess } from 'payload'

export const isSuperAdminAccess: Access<User> = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}

export const isSuperAdminFieldAccess: FieldAccess<User> = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}

export const isSuperAdmin = (user: User | null): boolean => {
  return Boolean(user?.roles?.includes('super-admin'))
}
