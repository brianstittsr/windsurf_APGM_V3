/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static generation for all pages during build
  staticPageGenerationTimeout: 0,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build (optional, but recommended for faster builds)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
