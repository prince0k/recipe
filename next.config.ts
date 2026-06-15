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

      // --- DIET PLAN OPTIMIZED MAPPINGS & SUFFIXES (Resolving crawled 404s + consolidations) ---
      // 1. Soy-Free
      {
        source: "/diet-plan/7-day-soy-free-vegan-reset-fueling-vitality-without-tofu-pptnr",
        destination: "/diet-plan/7-day-soy-free-meal-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-soy-free-vegan-reset-fueling-vitality-without-tofu",
        destination: "/diet-plan/7-day-soy-free-meal-plan",
        permanent: true,
      },
      // 2. Fatty Liver
      {
        source: "/diet-plan/7-day-fatty-liver-reversal-protocol-clean-restorative-eating-yhgzq",
        destination: "/diet-plan/7-day-fatty-liver-meal-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-fatty-liver-reversal-protocol-clean-restorative-eating",
        destination: "/diet-plan/7-day-fatty-liver-meal-plan",
        permanent: true,
      },
      // 3. Osteoporosis
      {
        source: "/diet-plan/7-day-osteoporosis-defense-plan-calcium-bone-building-nutrition-tl21f",
        destination: "/diet-plan/7-day-osteoporosis-meal-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-osteoporosis-defense-plan-calcium-bone-building-nutrition",
        destination: "/diet-plan/7-day-osteoporosis-meal-plan",
        permanent: true,
      },
      // 4. Nightshade-Free
      {
        source: "/diet-plan/7-day-nightshade-free-plan-joint-relief-through-food-xumeg",
        destination: "/diet-plan/7-day-nightshade-free-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-nightshade-free-plan-joint-relief-through-food",
        destination: "/diet-plan/7-day-nightshade-free-diet-plan",
        permanent: true,
      },
      // 5. Fertility
      {
        source: "/diet-plan/7-day-fertility-boosting-plan-nutrients-for-conception-kris0",
        destination: "/diet-plan/7-day-fertility-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-fertility-boosting-plan-nutrients-for-conception",
        destination: "/diet-plan/7-day-fertility-diet-plan",
        permanent: true,
      },
      // 6. Alkaline
      {
        source: "/diet-plan/7-day-alkaline-diet-reset-ph-balance-for-energy-clarity-9yukr",
        destination: "/diet-plan/7-day-alkaline-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-alkaline-diet-reset-ph-balance-for-energy-clarity",
        destination: "/diet-plan/7-day-alkaline-diet-plan",
        permanent: true,
      },
      // 7. Raw Food
      {
        source: "/diet-plan/7-day-raw-food-recharge-living-enzymes-for-vibrant-health-tqfzn",
        destination: "/diet-plan/7-day-raw-food-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-raw-food-recharge-living-enzymes-for-vibrant-health",
        destination: "/diet-plan/7-day-raw-food-diet-plan",
        permanent: true,
      },
      // 8. Kidney Health
      {
        source: "/diet-plan/7-day-kidney-health-reset-low-oxalate-kidney-friendly-nutrition-axx6n",
        destination: "/diet-plan/7-day-kidney-health-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-kidney-health-reset-low-oxalate-kidney-friendly-nutrition",
        destination: "/diet-plan/7-day-kidney-health-diet-plan",
        permanent: true,
      },
      // 9. Sleep Optimization
      {
        source: "/diet-plan/7-day-sleep-optimization-nutrition-plan-eat-your-way-to-deep-rest-rxrys",
        destination: "/diet-plan/7-day-sleep-optimization-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-sleep-optimization-nutrition-plan-eat-your-way-to-deep-rest",
        destination: "/diet-plan/7-day-sleep-optimization-diet-plan",
        permanent: true,
      },
      // 10. Budget Clean Eating
      {
        source: "/diet-plan/7-day-budget-reset-eat-clean-for-under-50-per-week-dgpun",
        destination: "/diet-plan/7-day-budget-clean-eating-meal-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-budget-reset-eat-clean-for-under-50-per-week",
        destination: "/diet-plan/7-day-budget-clean-eating-meal-plan",
        permanent: true,
      },
      // 11. Prenatal
      {
        source: "/diet-plan/7-day-prenatal-nutrition-blueprint-first-trimester-essentials-sbkb0",
        destination: "/diet-plan/7-day-prenatal-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-prenatal-nutrition-blueprint-first-trimester-essentials",
        destination: "/diet-plan/7-day-prenatal-diet-plan",
        permanent: true,
      },
      // 12. AIP
      {
        source: "/diet-plan/7-day-autoimmune-protocol-aip-calm-the-storm-within-l4hg9",
        destination: "/diet-plan/7-day-aip-diet-plan",
        permanent: true,
      },
      {
        source: "/diet-plan/7-day-autoimmune-protocol-aip-calm-the-storm-within",
        destination: "/diet-plan/7-day-aip-diet-plan",
        permanent: true,
      },

      // --- RECIPE OPTIMIZED MAPPINGS & CONSOLIDATION ---
      // 1. Sirloin Steak
      {
        source: "/recipes/perfectly-grilled-sirloin-steak-a-nutriguide-signature",
        destination: "/recipes/grilled-sirloin-steak-recipe",
        permanent: true,
      },
      {
        source: "/recipes/perfectly-grilled-sirloin-steak",
        destination: "/recipes/grilled-sirloin-steak-recipe",
        permanent: true,
      },
      // 2. NY Strip Steak
      {
        source: "/recipes/perfect-pan-seared-ny-strip-steak",
        destination: "/recipes/new-york-strip-steak-recipe",
        permanent: true,
      },
      {
        source: "/recipes/pan-seared-ny-strip-steak",
        destination: "/recipes/new-york-strip-steak-recipe",
        permanent: true,
      },
      // 3. White Fish
      {
        source: "/recipes/lemon-herb-baked-white-fish-a-simple-healthy-dinner",
        destination: "/recipes/healthy-white-fish-recipes",
        permanent: true,
      },
      {
        source: "/recipes/lemon-herb-baked-white-fish-a-clean-light-supper",
        destination: "/recipes/healthy-white-fish-recipes",
        permanent: true,
      },
      {
        source: "/recipes/lemon-herb-baked-white-fish",
        destination: "/recipes/healthy-white-fish-recipes",
        permanent: true,
      },
      // 4. Chia Pudding
      {
        source: "/recipes/simple-almond-milk-chia-seed-pudding",
        destination: "/recipes/almond-milk-chia-pudding-recipe",
        permanent: true,
      },
      {
        source: "/recipes/creamy-almond-milk-chia-pudding",
        destination: "/recipes/almond-milk-chia-pudding-recipe",
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
      // 5. Banana Protein Shake
      {
        source: "/recipes/the-perfect-protein-banana-shake-a-balanced-morning-fuel",
        destination: "/recipes/banana-protein-shake-recipe",
        permanent: true,
      },
      {
        source: "/recipes/protein-banana-shake",
        destination: "/recipes/banana-protein-shake-recipe",
        permanent: true,
      },
      // 6. Greek Yogurt Bowl
      {
        source: "/recipes/creamy-greek-yogurt-flaxseed-power-bowl",
        destination: "/recipes/greek-yogurt-flaxseed-bowl",
        permanent: true,
      },
      {
        source: "/recipes/greek-yogurt-with-toasted-sunflower-seeds",
        destination: "/recipes/creamy-greek-yogurt-with-toasted-sunflower-seeds",
        permanent: true,
      },
      {
        source: "/recipes/creamy-greek-yogurt-with-golden-toasted-sunflower-seeds",
        destination: "/recipes/creamy-greek-yogurt-with-toasted-sunflower-seeds",
        permanent: true,
      },
      // 7. Tuna Salad
      {
        source: "/recipes/zesty-tuna-salad-with-toasted-flax-seeds",
        destination: "/recipes/flaxseed-tuna-salad-recipe",
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
      // 8. Creamy Protein Smoothie with Flaxseed
      {
        source: "/recipes/creamy-protein-smoothie-with-flaxseed",
        destination: "/recipes/flaxseed-protein-shake-recipe",
        permanent: true,
      },
      // 9. Carrot Sticks and Hummus
      {
        source: "/recipes/fresh-carrot-sticks-with-creamy-homemade-hummus",
        destination: "/recipes/carrot-sticks-and-hummus-recipe",
        permanent: true,
      },
      // 10. Apple Slices with Almond Butter
      {
        source: "/recipes/crisp-apple-slices-with-creamy-almond-butter",
        destination: "/recipes/apple-slices-with-almond-butter-recipe",
        permanent: true,
      },
      // 11. Poached Egg Avocado Toast
      {
        source: "/recipes/perfectly-poached-eggs-on-smashed-avocado-toast",
        destination: "/recipes/poached-egg-avocado-on-toast",
        permanent: true,
      },
      // 12. Bulletproof Coffee (Not customized but setup for standard redirects)
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
      // 13. Zesty Chicken Breast
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
