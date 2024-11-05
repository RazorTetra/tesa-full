// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      }
    ],
  },
  // Jika menggunakan typescript, tambahkan ini
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;