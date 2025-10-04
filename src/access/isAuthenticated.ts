import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export const authenticated: Access<User> = ({ req: { user } }) => {
  return Boolean(user)
}

export const authenticatedFieldAccess: FieldAccess<User> = ({ req: { user } }) => {
  return Boolean(user)
}
