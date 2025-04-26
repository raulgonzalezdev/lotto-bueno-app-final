/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  env: {
    HOST: process.env.NEXT_PUBLIC_API_URL
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
