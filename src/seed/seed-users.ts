import { Tenant } from '@/payload-types'
import { Payload } from 'payload'

export default async function seedUsers(payload: Payload, tenants: Tenant[]) {
  if (!tenants || tenants.length === 0) {
    throw new Error('No tenants available for user creation')
  }

  console.log(
    'Creating users with tenants:',
    tenants.map((t) => ({ id: t.id, name: t.name })),
  )

  try {
    console.log('Creating super admin...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'superadmin@example.com',
        password: 'password',
        roles: ['super-admin'],
        tenant: tenants[0].id,
        tenants: [
          {
            tenant: tenants[0].id,
            roles: ['tenant-admin'],
          },
          {
            tenant: tenants[1].id,
            roles: ['tenant-admin'],
          },
          {
            tenant: tenants[2].id,
            roles: ['tenant-admin'],
          },
        ],
      },
    })
    console.log('Super admin created successfully')

    console.log('Creating tenant 1 admin...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-1-admin@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[0].id,
        tenants: [{ tenant: tenants[0].id, roles: ['tenant-admin'] }],
      },
    })
    console.log('Tenant 1 admin created successfully')

    console.log('Creating tenant 1 user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-1-user@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[0].id,
        tenants: [{ tenant: tenants[0].id, roles: ['tenant-viewer'] }],
      },
    })
    console.log('Tenant 1 user created successfully')

    console.log('Creating tenant 2 admin...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-2-admin@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[1].id,
        tenants: [{ tenant: tenants[1].id, roles: ['tenant-admin'] }],
      },
    })
    console.log('Tenant 2 admin created successfully')

    console.log('Creating tenant 2 user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-2-user@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[1].id,
        tenants: [{ tenant: tenants[1].id, roles: ['tenant-viewer'] }],
      },
    })
    console.log('Tenant 2 user created successfully')

    console.log('Creating tenant 3 admin...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-3-admin@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[2].id,
        tenants: [{ tenant: tenants[2].id, roles: ['tenant-admin'] }],
      },
    })
    console.log('Tenant 3 admin created successfully')

    // create tenant 3 user
    console.log('Creating tenant 3 user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'tenant-3-user@example.com',
        password: 'password',
        roles: ['user'],
        tenant: tenants[2].id,
        tenants: [{ tenant: tenants[2].id, roles: ['tenant-viewer'] }],
      },
    })
    console.log('Tenant 3 user created successfully')
  } catch (error) {
    console.error('Error creating users:', error)
    throw error
  }
}
