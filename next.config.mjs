import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  output: 'standalone',
  // Configure for large file uploads (5GB limit)
  experimental: {
    // Increase body size limit for large file uploads
    serverActions: {
      bodySizeLimit: '5gb',
    },
  },
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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
