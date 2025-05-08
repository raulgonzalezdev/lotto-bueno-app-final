/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
    domains: ['ahorasi.online', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ahorasi.online',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      }
    ]
  },
  // Configurar correctamente assetPrefix
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://ahorasi.online' : '',
  // Mantener basePath vacío
  basePath: '',
  async headers() {
    return [
      {
        // Aplica estos encabezados a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Accept',
          }
        ],
      },
      {
        // Configuración específica para archivos JS
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript'
          }
        ]
      },
      {
        // Configuración específica para archivos CSS
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css'
          }
        ]
      }
    ]
  },
  // Habilitar compresión para mejor rendimiento
  compress: true,
  // No usar trailing slash para URLs
  trailingSlash: false,
  // Permitir referencias circulares para Material UI
  experimental: {
    esmExternals: 'loose'
  },
  // Configuración específica para mejorar el manejo de archivos estáticos
  poweredByHeader: false,
  generateEtags: true
};

module.exports = nextConfig;
