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
    domains: ['simuladorparametrica.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'simuladorparametrica.com',
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
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://simuladorparametrica.com' : '',
  // Mantener basePath vacío
  basePath: '',
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
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
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
