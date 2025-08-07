import { Whitelabel } from '@/payload-types'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

export const getUrlFromHost = (host: string) => {
  const cleanHost = host.replace('https://', '').replace('http://', '')
  const hostname = cleanHost.split(':')[0]

  return hostname
}

export const getTenantFromRequest = async () => {
  const headersList = await headers()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const host = headersList.get('host')
  if (!host) {
    return null
  }
  const url = getUrlFromHost(host)
  if (url) {
    try {
      const tenant = await payload.find({
        collection: 'tenants',
        where: {
          domain: {
            equals: url,
          },
          isActive: {
            equals: true,
          },
        },
        limit: 1,
      })

      if (tenant.docs.length > 0) {
        return tenant.docs[0].id
      }
    } catch (error) {
      console.error('Error finding tenant by domain:', error)
    }
  }

  return null
}

export const getTenantLogo = async () => {
  const tenantId = await getTenantFromRequest()
  const headersList = await headers()

  const host = headersList.get('host')
  if (!tenantId || !host) {
    return '/vrhotelo-logo.png'
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    if (tenant.whitelabel) {
      const whitelabel = tenant.whitelabel as Whitelabel

      return whitelabel.url
    }
  } catch (error) {
    console.error('Error fetching tenant logo:', error)
  }

  // Return default logo if no tenant logo found
  return '/vrhotelo-logo.png'
}
