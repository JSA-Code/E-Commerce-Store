import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // * for 30 sec pages are cached
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
