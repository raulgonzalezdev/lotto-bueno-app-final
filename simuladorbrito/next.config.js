/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3005
  },
  // Configuración para producción
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    domains: ['simuladorparametrica.com']
  },
  // Configuración de assetPrefix para asegurar que las rutas de los activos sean absolutas
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://simuladorparametrica.com' : '',
  basePath: '',
  experimental: {
    // Esto es necesario para la compilación standalone
    outputStandalone: true
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
