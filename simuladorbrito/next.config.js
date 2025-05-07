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
  // Eliminamos assetPrefix para evitar problemas con rutas relativas
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
          }
        ]
      }
    ]
  },
  // Deshabilitar compresión para facilitar la depuración
  compress: false,
  // Configurar el manejo de rutas estáticas
  trailingSlash: false,
  // Permitir referencias circulares para Material UI
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
