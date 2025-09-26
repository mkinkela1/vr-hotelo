// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Tenants } from '@/collections/Tenants/Tenants'
import { Whitelabels } from '@/collections/Whitelabels'
import { multiTenantPlugin } from '@/plugins/multi-tenant-plugin'
import { s3Plugin } from '@/plugins/s3.plugin'
import { Media } from './collections/Media'
import { Users } from './collections/Users/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    theme: 'light',
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: './graphics/Icon.tsx#Icon',
        Logo: './graphics/Logo.tsx#Logo',
      },
    },
  },
  collections: [Users, Media, Tenants, Whitelabels],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    logger: true,
  }),
  sharp,
  plugins: [payloadCloudPlugin(), multiTenantPlugin, s3Plugin],
  // Enable debug mode to see queries
  debug: true,
})
