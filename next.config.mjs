/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/widget/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // This will override the default, then we'll handle it in middleware
          },
        ],
      },
    ]
  },
};

export default nextConfig;