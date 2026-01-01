// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Tenants } from '@/collections/Tenants/Tenants'
import { Thumbnails } from '@/collections/Thumbnails'
import { Whitelabels } from '@/collections/Whitelabels'
import { multiTenantPlugin } from '@/plugins/multi-tenant-plugin'
import { s3Plugin } from '@/plugins/s3.plugin'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Media } from './collections/Media/Media'
import { Users } from './collections/Users/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      icons: [{ url: '/favicon.png', rel: 'icon', type: 'image/png' }],
      title: 'VR Hotelo Admin',
    },
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

  collections: [Users, Media, Tenants, Whitelabels, Thumbnails],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      application_name: 'vrhotelo-payload',
      connectionString: process.env.DATABASE_URI || '',
      min: 1,
      max: 5,
      idleTimeoutMillis: 30000,
      maxUses: 1000,
      log: (...args) => console.log(new Date().toISOString(), 'PG Pool:', ...args),
    },
    logger: true,
  }),
  email: nodemailerAdapter({
    defaultFromAddress: 'support@vrhotelo.com',
    defaultFromName: 'VR Hotelo - Support',
    transportOptions: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
      debug: true,
      logger: true,
    },
  }),
  sharp,
  plugins: [payloadCloudPlugin(), multiTenantPlugin, s3Plugin],
  debug: true,
})
