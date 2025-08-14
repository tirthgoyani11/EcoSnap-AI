/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['images.openfoodfacts.org', 'world.openfoodfacts.org'],
  },
  // App Router is enabled by default now
}

module.exports = nextConfig
