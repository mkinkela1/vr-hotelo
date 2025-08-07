import { Tenant } from '@/payload-types'
import { Payload } from 'payload'

export default async function seedWhitelabels(payload: Payload, tenants: Tenant[]) {
  const files = ['tenant-1.jpg', 'tenant-2.jpg', 'tenant-3.jpg']

  let count = 0

  for (const tenant of tenants) {
    await payload.create({
      collection: 'whitelabels',
      data: {
        tenant: tenant.id,
        url: `/${files[count]}`,
      },
      filePath: `public/${files[count]}`,
      overwriteExistingFiles: true,
    })
    count++
  }

  console.log('Created whitelabels for all tenants')
}
