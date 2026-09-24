import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/getkey',
        destination: 'https://zeternity.online/getkey',
        permanent: true,
      },
      {
        source: '/eternityblox/getkey',
        destination: 'https://zeternity.online/getkey',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
