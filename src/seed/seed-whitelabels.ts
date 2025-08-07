import { Payload } from 'payload'

export default async function seedWhitelabels(payload: Payload) {
  // First, get all tenants
  const tenants = await payload.find({
    collection: 'tenants',
  })

  // Create a sample media file for the logo
  const logoMedia = await payload.create({
    collection: 'media',
    data: {
      alt: 'Sample Logo',
      filename: 'sample-logo.png',
      mimeType: 'image/png',
      filesize: 1024,
      width: 200,
      height: 200,
      url: '/media/sample-logo.png',
      thumbnailURL: '/media/sample-logo-thumbnail.png',
    },
  })

  // Create whitelabels for each tenant
  for (const tenant of tenants.docs) {
    await payload.create({
      collection: 'whitelabels',
      data: {
        tenant: tenant.id,
        logo: logoMedia.id,
      },
    })
  }

  console.log('Created whitelabels for all tenants')
}
