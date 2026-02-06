import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sochtechnologies.com",
        port: "",
        pathname: "/pokemon/sprites/**",
      },
    ],
  }
};

export default nextConfig;
