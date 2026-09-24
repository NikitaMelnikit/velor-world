import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Real photography plugs into <Media src>; these settings keep it lean.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1080, 1440, 1920, 2560],
    imageSizes: [96, 192, 320, 480],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "framer-motion"],
  },
};

export default nextConfig;
