import { getTenantFromRequest, getUrlFromHost } from '@/utils/get-tenant-from-request'
import { getUserTenantIDs } from '@/utils/get-user-tenant-id'
import { CollectionBeforeLoginHook } from 'payload'

// Main admin domains where super-admins can login without tenant restriction
const ADMIN_DOMAINS = ['app.vrhotelo.com', 'localhost', 'localhost:3000']

export const validateTenantAccess: CollectionBeforeLoginHook = async ({ req, user: reqUser }) => {
  const host = req.headers?.get?.('host') || 'unknown'
  const hostname = getUrlFromHost(host)

  console.log({ host, hostname })

  // #region agent log
  console.log(
    '[DEBUG:LOGIN]',
    JSON.stringify({
      event: 'validateTenantAccess',
      host,
      hostname,
      userEmail: reqUser?.email,
      userRoles: reqUser?.roles,
      isSuperAdmin: reqUser?.roles?.includes('super-admin'),
      isAdminDomain: ADMIN_DOMAINS.includes(hostname),
      timestamp: new Date().toISOString(),
    }),
  )
  // #endregion

  // Super-admins can login from any domain
  if (reqUser?.roles?.includes('super-admin')) {
    console.log('[DEBUG:LOGIN] Super-admin login allowed from:', hostname)
    return reqUser
  }

  // Allow login from main admin domains (for super-admins trying to login)
  // The super-admin check above handles authorized access
  // For non-super-admins on admin domains, we still need to validate
  if (ADMIN_DOMAINS.includes(hostname)) {
    // On admin domains, allow login but the user will have limited access
    // This is handled by access control in collections
    console.log('[DEBUG:LOGIN] Login from admin domain, allowing:', hostname)
    return reqUser
  }

  // Get the current tenant from the request
  const currentTenantId = await getTenantFromRequest()

  // If no tenant is found in the request, block non-super-admin users
  if (!currentTenantId) {
    // #region agent log
    console.log(
      '[DEBUG:LOGIN]',
      JSON.stringify({
        event: 'loginBlocked',
        reason: 'no_tenant_for_domain',
        host,
        userEmail: reqUser?.email,
        timestamp: new Date().toISOString(),
      }),
    )
    // #endregion
    throw new Error(`Access denied: Domain "${host}" is not registered as a tenant.`)
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
