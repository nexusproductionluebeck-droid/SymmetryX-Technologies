/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@magnax/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
