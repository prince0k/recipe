import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "stewartlucas.com",
      },
      {
        protocol: "http",
        hostname: "localhost", // For local uploads
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
};

export default nextConfig;
