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
      /*
       * REDIRECT ORDERING RULES:
       * 1. Specific legacy routes (e.g., precise paths with AI suffixes like -pptnr) MUST be defined 
       *    before general patterns or wildcards to ensure they match exactly first.
       * 2. Group redirects logically (e.g. Diet Plans, Recipes, Blog Cleanup).
       * 3. Use permanent: true (301 redirect) to transfer SEO authority and link equity.
       */

      // --- DIET PLAN LEGACY SUFFIXES (Resolving crawled 404s) ---
      {
        source: "/diet-plan/7-day-soy-free-vegan-reset-fueling-vitality-without-tofu-pptnr",
        destination: "/diet-plan/7-day-soy-free-vegan-reset-fueling-vitality-without-tofu",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-fatty-liver-reversal-protocol-clean-restorative-eating-yhgzq",
        destination: "/diet-plan/7-day-fatty-liver-reversal-protocol-clean-restorative-eating",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-osteoporosis-defense-plan-calcium-bone-building-nutrition-tl21f",
        destination: "/diet-plan/7-day-osteoporosis-defense-plan-calcium-bone-building-nutrition",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-nightshade-free-plan-joint-relief-through-food-xumeg",
        destination: "/diet-plan/7-day-nightshade-free-plan-joint-relief-through-food",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-fertility-boosting-plan-nutrients-for-conception-kris0",
        destination: "/diet-plan/7-day-fertility-boosting-plan-nutrients-for-conception",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-alkaline-diet-reset-ph-balance-for-energy-clarity-9yukr",
        destination: "/diet-plan/7-day-alkaline-diet-reset-ph-balance-for-energy-clarity",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-raw-food-recharge-living-enzymes-for-vibrant-health-tqfzn",
        destination: "/diet-plan/7-day-raw-food-recharge-living-enzymes-for-vibrant-health",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-kidney-health-reset-low-oxalate-kidney-friendly-nutrition-axx6n",
        destination: "/diet-plan/7-day-kidney-health-reset-low-oxalate-kidney-friendly-nutrition",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-sleep-optimization-nutrition-plan-eat-your-way-to-deep-rest-rxrys",
        destination: "/diet-plan/7-day-sleep-optimization-nutrition-plan-eat-your-way-to-deep-rest",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-budget-reset-eat-clean-for-under-50-per-week-dgpun",
        destination: "/diet-plan/7-day-budget-reset-eat-clean-for-under-50-per-week",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-prenatal-nutrition-blueprint-first-trimester-essentials-sbkb0",
        destination: "/diet-plan/7-day-prenatal-nutrition-blueprint-first-trimester-essentials",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-autoimmune-protocol-aip-calm-the-storm-within-l4hg9",
        destination: "/diet-plan/7-day-autoimmune-protocol-aip-calm-the-storm-within",
        permanent: true,
      },

      // --- RECIPE LEGACY SUFFIXES & DUPLICATE CONSOLIDATION ---
      {
        source: "/recipes/perfectly-grilled-sirloin-steak-a-nutriguide-signature",
        destination: "/recipes/perfectly-grilled-sirloin-steak",
        permanent: true,
      },
      {
        source: "/recipes/perfect-pan-seared-ny-strip-steak",
        destination: "/recipes/pan-seared-ny-strip-steak",
        permanent: true,
      },
      {
        source: "/recipes/lemon-herb-baked-white-fish-a-simple-healthy-dinner",
        destination: "/recipes/lemon-herb-baked-white-fish",
        permanent: true,
      },
      {
        source: "/recipes/lemon-herb-baked-white-fish-a-clean-light-supper",
        destination: "/recipes/lemon-herb-baked-white-fish",
        permanent: true,
      },
      {
        source: "/recipes/the-perfect-bulletproof-coffee-a-smooth-energizing-morning-ritual",
        destination: "/recipes/bulletproof-coffee",
        permanent: true,
      },
      {
        source: "/recipes/the-golden-ritual-authentic-bulletproof-coffee",
        destination: "/recipes/bulletproof-coffee",
        permanent: true,
      },
      {
        source: "/recipes/mediterranean-tuna-salad-9zwb",
        destination: "/recipes/mediterranean-tuna-salad",
        permanent: true,
      },
      {
        source: "/recipes/mediterranean-tuna-salad-bowl",
        destination: "/recipes/mediterranean-tuna-salad",
        permanent: true,
      },
      {
        source: "/recipes/mediterranean-tuna-salad-with-extra-virgin-olive-oil",
        destination: "/recipes/mediterranean-tuna-salad",
        permanent: true,
      },
      {
        source: "/recipes/creamy-overnight-chia-seed-pudding-a-simple-morning-reset",
        destination: "/recipes/creamy-overnight-chia-seed-pudding",
        permanent: true,
      },
      {
        source: "/recipes/creamy-overnight-chia-seed-pudding-a-simple-morning-staple",
        destination: "/recipes/creamy-overnight-chia-seed-pudding",
        permanent: true,
      },
      {
        source: "/recipes/creamy-coconut-chia-seed-pudding-a-simple-morning-staple",
        destination: "/recipes/creamy-coconut-chia-pudding",
        permanent: true,
      },
      {
        source: "/recipes/creamy-coconut-chia-seed-pudding",
        destination: "/recipes/creamy-coconut-chia-pudding",
        permanent: true,
      },
      {
        source: "/recipes/zesty-lemon-herb-chicken-breast-a-simple-vibrant-dinner",
        destination: "/recipes/zesty-lemon-herb-chicken-breast",
        permanent: true,
      },
      {
        source: "/recipes/zesty-lemon-herb-grilled-chicken-salad-drnxh",
        destination: "/recipes/zesty-lemon-herb-chicken-breast",
        permanent: true,
      },
      {
        source: "/recipes/lemon-herb-roasted-chicken-the-perfect-weeknight-classic",
        destination: "/recipes/lemon-herb-roasted-chicken",
        permanent: true,
      },

      // --- HISTORICAL CLEANUP REDIRECTS ---
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
