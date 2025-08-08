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
        // Allow widget pages to be embedded in iframes - remove X-Frame-Options entirely
        source: '/widget/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *'
          }
        ],
      }
    ]
  },
};

export default nextConfig;