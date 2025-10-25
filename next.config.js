/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static generation for all pages during build
  staticPageGenerationTimeout: 0,
};

module.exports = nextConfig;
