import { Payload } from 'payload'

const tenants = [
  {
    name: 'Tenant 1',
    slug: 'tenant-1',
    domain: 'tenant1.vrhotelo.local',
  },
  {
    name: 'Tenant 2',
    slug: 'tenant-2',
    domain: 'tenant2.vrhotelo.local',
  },
  {
    name: 'Tenant 3',
    slug: 'tenant-3',
    domain: 'tenant3.vrhotelo.local',
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
    sort: 'name',
  })

  return allTenants.docs
}
