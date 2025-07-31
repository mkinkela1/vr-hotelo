import seedTenants from '@/seed/seed-tenants'
import seedUsers from '@/seed/seed-users'
import payload from '@/utils/payload'

async function runSeed() {
  console.log('Seeding started...')

  const existingUsers = await payload.find({
    collection: 'users',
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

  const tenants = await seedTenants(payload)
  const users = await seedUsers(payload, tenants)

  console.log('Seeded tenants and users')

  process.exit(0)
}

runSeed()
