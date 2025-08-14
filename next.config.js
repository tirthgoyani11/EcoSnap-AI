/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['images.openfoodfacts.org', 'world.openfoodfacts.org'],
  },
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig
