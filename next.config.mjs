import { withPayload } from '@payloadcms/next/withPayload'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'

// Generate a consistent build ID based on package.json to ensure
// server action IDs remain stable across container restarts
const generateConsistentBuildId = () => {
  try {
    const packageJson = readFileSync('./package.json', 'utf8')
    const hash = createHash('sha256').update(packageJson).digest('hex').substring(0, 12)
    return `build-${hash}`
  } catch {
    return 'build-default'
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  output: 'standalone',
  // Use consistent build ID to prevent server action ID mismatches
  generateBuildId: async () => {
    const buildId = process.env.BUILD_ID || generateConsistentBuildId()
    console.log(`[BUILD] Using build ID: ${buildId}`)
    return buildId
  },
  // Configure for large file uploads (5GB limit)
  experimental: {
    // Increase body size limit for large file uploads
    serverActions: {
      bodySizeLimit: '5gb',
      // Allow all origins for server actions (needed for multi-tenant)
      // Using wildcard patterns for multi-tenant subdomains
      allowedOrigins: ['localhost:3000', '*.vrhotelo.com', '*.app.vrhotelo.com'],
    },
  },
  // Disable static optimization for payload admin to prevent stale caching
  skipMiddlewareUrlNormalize: true,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**.vrhotelo.local',
        port: '3000',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            // Include Next.js server action headers (Next-Action, Next-Router-State-Tree, etc.)
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, RSC, Cookie',
          },
        ],
      },
      // Prevent caching of admin pages to avoid stale server action IDs
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      // Prevent caching of API routes
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
