import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // port: '',
        // pathname: '/**',
        // search: '',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        // port: '',
        // pathname: '/**',
        // search: '',
      },
    ],
  },
};

export default nextConfig;
