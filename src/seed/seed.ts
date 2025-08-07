import seedTenants from '@/seed/seed-tenants'
import seedUsers from '@/seed/seed-users'
import seedWhitelabels from '@/seed/seed-whitelabels'
import payload from '@/utils/payload'

async function runSeed() {
  console.log('Seeding started...')

  const existingUsers = await payload.find({
    collection: 'users',
  })

  // delete all media
  await payload.delete({
    collection: 'media',
    where: {},
  })

  // delete all users
  await payload.delete({
    collection: 'users',
    where: {
      id: {
        in: existingUsers.docs.map((user) => user.id),
      },
    },
  })

  const existingTenants = await payload.find({
    collection: 'tenants',
  })

  // delete all tenants
  await payload.delete({
    collection: 'tenants',
    where: {
      id: {
        in: existingTenants.docs.map((tenant) => tenant.id),
      },
    },
  })

  // delete all whitelabels
  await payload.delete({
    collection: 'whitelabels',
    where: {},
  })

  const tenants = await seedTenants(payload)
  const users = await seedUsers(payload, tenants)
  await seedWhitelabels(payload)

  console.log('Seeded tenants, users, and whitelabels')

  process.exit(0)
}

runSeed()
