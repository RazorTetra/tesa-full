// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { }) => {
    // Mengatasi deprecated punycode warning
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "punycode": false,
    };

    return config;
  },
};

module.exports = nextConfig;