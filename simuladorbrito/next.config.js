/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3005
  },
  // Configuración para producción
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests"
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
