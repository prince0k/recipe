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
        protocol: "http",
        hostname: "192.168.29.228", // Local network access
      },
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog/:slug*(kings-island|kfc|cincinnati|weather|greenland|frost-bank)",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug*-kings-island",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug*-kfc",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug*-cincinnati",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/:slug*-weather",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
