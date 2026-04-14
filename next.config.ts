import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Allow production builds even with type errors during early development.
    // TODO: Remove this once all strict-mode issues are resolved.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
