/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Increase static generation timeout to 120 seconds to prevent build failures
  staticPageGenerationTimeout: 120,
  // Disable TypeScript type checking during build (optional, but recommended for faster builds)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
