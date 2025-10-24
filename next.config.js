/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Disable static generation for pages that use client-side code
    appDir: true,
  },
  // Disable static generation for all pages during build
  staticPageGenerationTimeout: 0,
};

module.exports = nextConfig;
