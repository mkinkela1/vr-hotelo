import { User } from '@/payload-types'
import { getCollectionIDType } from '@/utils/get-collection-id-types'
import { getTenantFromCookie } from '@payloadcms/plugin-multi-tenant/utilities'
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
): Promise<CustomEndpointAuthorizationResponse> => {
  const { payload, user } = req

  // 1. Check if user exists
  if (!user) {
    return { error: 'Unauthorized', status: 401, data: undefined }
  }

  // 2. Get tenant from cookie and check if it exists
  const tenantFromCookie = getTenantFromCookie(
    req.headers,
    getCollectionIDType({ payload, collectionSlug: 'tenants' }),
  )

  if (!tenantFromCookie) {
    return { error: 'Tenant not found', status: 404, data: undefined }
  }

  // 3. Check if user has tenant-viewer role for this tenant
  const hasTenantViewerRole = user.tenants?.some(
    (tenant) => tenant.tenant === tenantFromCookie && tenant.roles.includes('tenant-viewer'),
  )

  if (!hasTenantViewerRole) {
    return { error: 'Unauthorized', status: 401, data: undefined }
  }

  // 4. Find tenant from user's tenant ID
  const tenantFromUser = await payload.findByID({
    collection: 'tenants',
    id: user.tenant as number,
  })

  if (!tenantFromUser) {
    return { error: 'Tenant not found', status: 404, data: undefined }
  }

  // 5. Check if tenant from cookie matches tenant from user
  if (tenantFromCookie !== tenantFromUser.id) {
    return { error: 'Tenant mismatch', status: 403, data: undefined }
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
