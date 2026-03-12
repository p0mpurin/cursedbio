import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/b/preview', destination: '/preview', permanent: true },
      { source: '/b/:username', destination: '/:username', permanent: true },
    ]
  },
}

export default nextConfig
