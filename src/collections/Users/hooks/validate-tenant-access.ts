import { getTenantFromRequest } from '@/utils/get-tenant-from-request'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { CollectionBeforeLoginHook } from 'payload'

export const validateTenantAccess: CollectionBeforeLoginHook = async ({ req, user: reqUser }) => {
  // Get the current tenant from the request
  const currentTenantId = await getTenantFromRequest()

  if (reqUser?.roles?.includes('super-admin')) {
    return reqUser
  }
  // If no tenant is found in the request, allow login (fallback to default behavior)
  if (!currentTenantId) {
    throw new Error('Access denied: You do not have permission to access this tenant domain.')
  }

  // Find the user by email to check their roles and tenant access
  const { payload } = req

  try {
    const user = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: reqUser.email,
        },
      },
      depth: 10,
      limit: 1,
    })

    if (user.docs.length === 0) {
      // User doesn't exist yet, allow login (will be handled by normal auth flow)
      return reqUser
    }

    const userDoc = user.docs[0]

    // Super-admin can access any tenant
    if (userDoc.roles?.includes('super-admin')) {
      return reqUser
    }

    // For tenant-admin and tenant-user, check if they have access to the current tenant
    const userTenantIds = getUserTenantIDs(userDoc)
    if (!userTenantIds.includes(currentTenantId)) {
      throw new Error('Access denied: You do not have permission to access this tenant domain.')
    }

    return reqUser
  } catch (error) {
    // If there's an error finding the user or validating access, throw the error
    throw error
  }
}
