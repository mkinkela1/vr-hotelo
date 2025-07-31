import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getTenantAccess } from '@payloadcms/plugin-multi-tenant/utilities'
import type { PayloadRequest } from 'payload'

/**
 * Get tenant-specific media query constraints
 * This function helps filter media by tenant or shared media
 */
export const getTenantMediaQuery = (req: PayloadRequest) => {
  if (!req.user) {
    return { isShared: { equals: true } }
  }

  // Super admins can see all media
  if (isSuperAdmin(req.user)) {
    return {}
  }

  const tenantAccess = getTenantAccess({ user: req.user, fieldName: 'tenant' })

  if (tenantAccess) {
    return {
      or: [{ isShared: { equals: true } }, tenantAccess],
    }
  }

  // Fallback to shared media only
  return { isShared: { equals: true } }
}

/**
 * Check if a user can access specific media
 */
export const canAccessMedia = (req: PayloadRequest, mediaDoc: any) => {
  if (!req.user) {
    return mediaDoc.isShared
  }

  if (isSuperAdmin(req.user)) {
    return true
  }

  if (mediaDoc.isShared) {
    return true
  }

  const tenantAccess = getTenantAccess({ user: req.user, fieldName: 'tenant' })
  return tenantAccess ? true : false
}

/**
 * Get media upload constraints based on tenant settings
 */
export const getMediaUploadConstraints = (req: PayloadRequest) => {
  // You can extend this to check tenant-specific upload settings
  // For now, return basic constraints
  return {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  }
}
