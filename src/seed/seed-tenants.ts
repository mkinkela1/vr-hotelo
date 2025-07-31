import { Payload } from 'payload'

const tenants = [
  {
    name: 'Tenant 1',
    slug: 'tenant-1',
    domain: 'tenant-1.com',
  },
  {
    name: 'Tenant 2',
    slug: 'tenant-2',
    domain: 'tenant-2.com',
  },
  {
    name: 'Tenant 3',
    slug: 'tenant-3',
    domain: 'tenant-3.com',
  },
]

export default async function seedTenants(payload: Payload) {
  for (const tenant of tenants) {
    await payload.create({
      collection: 'tenants',
      data: tenant,
    })
  }

  const allTenants = await payload.find({
    collection: 'tenants',
  })

  return allTenants.docs
}
