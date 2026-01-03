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

// #region agent log
// Debug: Log startup info and track memory stats
const debugStartTime = Date.now()

// Detect key format: base64 typically has +, /, = characters; hex is only 0-9a-f
const detectKeyFormat = (key: string | undefined) => {
  if (!key) return 'not-set'
  if (/^[0-9a-fA-F]+$/.test(key)) return 'hex'
  if (/^[A-Za-z0-9+/=]+$/.test(key)) return 'base64'
  return 'unknown'
}

const encryptionKey = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
const keyFormat = detectKeyFormat(encryptionKey)

// Log critical configuration at startup
console.log(
  '[DEBUG:STARTUP]',
  JSON.stringify({
    nodeEnv: process.env.NODE_ENV,
    hasEncryptionKey: !!encryptionKey,
    encryptionKeyLength: encryptionKey?.length || 0,
    keyFormat: keyFormat,
    keyFormatWarning:
      keyFormat === 'hex'
        ? 'WARNING: Key appears to be hex - Next.js expects base64! Use: openssl rand -base64 32'
        : keyFormat === 'not-set'
          ? 'WARNING: No encryption key set!'
          : null,
    hasBuildId: !!process.env.BUILD_ID,
    buildId: process.env.BUILD_ID || 'not-set',
    timestamp: new Date().toISOString(),
  }),
)

setInterval(() => {
  const memUsage = process.memoryUsage()
  const uptime = Math.floor((Date.now() - debugStartTime) / 1000)
  console.log(
    '[DEBUG:MEMORY]',
    JSON.stringify({
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
      externalMB: Math.round(memUsage.external / 1024 / 1024),
      uptimeSeconds: uptime,
      uptimeHours: Math.round((uptime / 3600) * 100) / 100,
      timestamp: new Date().toISOString(),
    }),
  )
}, 60000) // Log every 60 seconds
// #endregion

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
      // #region agent log
      log: (...args: any[]) => {
        console.log('[DEBUG:PGPOOL]', new Date().toISOString(), ...args)
      },
      // #endregion
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
