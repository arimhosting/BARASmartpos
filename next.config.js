/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos', 'cdn-icons-png.flaticon.com', 'api.qrserver.com'],
  },
}

module.exports = nextConfig