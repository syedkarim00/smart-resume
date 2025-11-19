import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsHmrCache: true,
  },
};

export default nextConfig;
