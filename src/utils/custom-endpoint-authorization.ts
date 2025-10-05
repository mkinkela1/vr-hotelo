import { User } from '@/payload-types'
import { extractID } from '@/utils/extract-id'
import { getTenantFromRequest } from '@/utils/get-tenant-from-request'
import { PayloadRequest } from 'payload'
import { Tenant } from '../payload-types'

type CustomEndpointAuthorizationResponse = {
  data?: {
    user: User
    tenant: Tenant
  }
  status: number
  error?: string
}

export const customEndpointAuthorization = async (
  req: PayloadRequest,
  tenantViewerOnly = true,
): Promise<CustomEndpointAuthorizationResponse> => {
  const { payload, user } = req

  // 1. Check if user exists
  if (!user) {
    return { error: 'Unauthorized: User not found', status: 401, data: undefined }
  }

  // 2. Get tenant from request
  const tenantFromRequest = await getTenantFromRequest()

  if (!tenantFromRequest) {
    return { error: 'Tenant not found: No tenant found in request', status: 404, data: undefined }
  }

  // 3. Check if user has tenant-viewer role for this tenant
  if (tenantViewerOnly) {
    const hasTenantViewerRole = user.tenants?.some(
      (tenant) =>
        extractID(tenant.tenant) === tenantFromRequest && tenant.roles.includes('tenant-viewer'),
    )

    if (!hasTenantViewerRole) {
      return {
        error: 'Unauthorized: User does not have tenant-viewer role',
        status: 401,
        data: undefined,
      }
    }
  }

  // 4. Find tenant from user's tenant ID
  const tenantFromUser = await payload.findByID({
    collection: 'tenants',
    id: extractID(user.tenants?.[0]?.tenant as Tenant) as number,
  })

  if (!tenantFromUser) {
    return { error: 'Tenant not found: No tenant found in user', status: 404, data: undefined }
  }

  // 5. Check if tenant from request matches tenant from user
  if (tenantFromRequest !== tenantFromUser.id) {
    return {
      error: `Tenant mismatch: ${tenantFromRequest} !== ${tenantFromUser.id}`,
      status: 403,
      data: undefined,
    }
  }

  // 6. Check if tenant license has not expired
  if (tenantFromUser.licenseExpiration) {
    const expirationDate = new Date(tenantFromUser.licenseExpiration)
    const currentDate = new Date()

    if (expirationDate <= currentDate) {
      return { error: 'Tenant license has expired', status: 403, data: undefined }
    }
  }

  // All checks passed - return user and tenant data
  return {
    error: undefined,
    data: {
      user,
      tenant: tenantFromUser,
    },
    status: 200,
  }
}
