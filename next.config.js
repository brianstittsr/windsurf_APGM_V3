/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect all requests to the submodule
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          destination: '/permanent-makeup-website/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
