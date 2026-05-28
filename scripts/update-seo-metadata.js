/**
 * ============================================================
 *  SEO METADATA UPDATE MIGRATION SCRIPT
 * ============================================================
 *  This script applies canonical, robots, and og:image metadata
 *  changes directly to the codebase page files. Useful for
 *  applying modifications directly on a VPS or target machine.
 *
 *  USAGE:
 *    node scripts/update-seo-metadata.js
 * ============================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");

// ── Define files and their replacement pairs ────────────────
const REPLACEMENTS = [
  // 1. Homepage
  {
    filePath: "app/(public)/page.tsx",
    target: `export const metadata: Metadata = {
  title: "NutriGuide by Stewart Lucas — Free Diet Plans & Healthy Recipes",
  description: "Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.",
  twitter: {
    card: "summary_large_image",
    title: "NutriGuide by Stewart Lucas",
    description: "Free science-backed diet plans and healthy recipes.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
};`,
    replacement: `export const metadata: Metadata = {
  title: "NutriGuide by Stewart Lucas — Free Diet Plans & Healthy Recipes",
  description: "Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NutriGuide by Stewart Lucas — Free Diet Plans & Healthy Recipes",
    description: "Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.",
    url: "https://stewartlucas.com/",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NutriGuide by Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriGuide by Stewart Lucas",
    description: "Free science-backed diet plans and healthy recipes.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};`
  },

  // 2. About Page
  {
    filePath: "app/(public)/about/page.tsx",
    target: `export const metadata: Metadata = {
  title: "About Stewart Lucas | Home Cooking Simplified",
  description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
  twitter: {
    card: "summary_large_image",
    title: "About Stewart Lucas | Home Cooking Simplified",
    description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
    images: ["https://stewartlucas.com/assets/stewart_lucas.webp"],
  },
};`,
    replacement: `export const metadata: Metadata = {
  title: "About Stewart Lucas | Home Cooking Simplified",
  description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Stewart Lucas | Home Cooking Simplified",
    description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
    url: "https://stewartlucas.com/about",
    images: [
      {
        url: "https://stewartlucas.com/assets/stewart_lucas.webp",
        width: 1200,
        height: 630,
        alt: "About Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Stewart Lucas | Home Cooking Simplified",
    description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
    images: ["https://stewartlucas.com/assets/stewart_lucas.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};`
  },

  // 3. Contact Page
  {
    filePath: "app/(public)/contact/page.tsx",
    target: `export const metadata: Metadata = {
  title: "Contact Us | Stewart Lucas",
  description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Stewart Lucas",
    description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
};`,
    replacement: `export const metadata: Metadata = {
  title: "Contact Us | Stewart Lucas",
  description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Stewart Lucas",
    description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
    url: "https://stewartlucas.com/contact",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Us | Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Stewart Lucas",
    description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};`
  },

  // 4. Privacy Policy Page
  {
    filePath: "app/(public)/privacy-policy/page.tsx",
    target: `export const metadata: Metadata = {
  title: "Privacy Policy | Lucas Stewart Ventures",
  description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Lucas Stewart Ventures",
    description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
};`,
    replacement: `export const metadata: Metadata = {
  title: "Privacy Policy | Lucas Stewart Ventures",
  description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Lucas Stewart Ventures",
    description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
    url: "https://stewartlucas.com/privacy-policy",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Privacy Policy | Lucas Stewart Ventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Lucas Stewart Ventures",
    description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};`
  },

  // 5. Blog Page (List)
  {
    filePath: "app/(public)/blog/page.tsx",
    target: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
  };`,
    replacement: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 6. Blog Details
  {
    filePath: "app/(public)/blog/[slug]/page.tsx",
    target: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
  };`,
    replacement: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 7. Cheat Sheets Page (List)
  {
    filePath: "app/(public)/cheat-sheets/page.tsx",
    target: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
  };`,
    replacement: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 8. Cheat Sheet Details
  {
    filePath: "app/(public)/cheat-sheets/[slug]/page.tsx",
    target: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
  };`,
    replacement: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 9. Diet Plans Page (List)
  {
    filePath: "app/(public)/diet-plan/page.tsx",
    target: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
  };`,
    replacement: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 10. Diet Plan Details
  {
    filePath: "app/(public)/diet-plan/[slug]/page.tsx",
    target: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
  };`,
    replacement: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 11. Recipes Page (List)
  {
    filePath: "app/(public)/recipes/page.tsx",
    target: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
  };`,
    replacement: `    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  },

  // 12. Recipe Details
  {
    filePath: "app/(public)/recipes/[slug]/page.tsx",
    target: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
  };`,
    replacement: `    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [cleanCover],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };`
  }
];

function run() {
  console.log("🚀 Starting SEO Metadata modifications script...\n");

  let modifiedCount = 0;

  for (const item of REPLACEMENTS) {
    const fullPath = path.join(ROOT_DIR, item.filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${item.filePath}`);
      continue;
    }

    let content = fs.readFileSync(fullPath, "utf-8");

    // Standardize CRLF to LF to avoid issues with target matches on line endings
    const normalizedContent = content.replace(/\r\n/g, "\n");
    const normalizedTarget = item.target.replace(/\r\n/g, "\n");
    const normalizedReplacement = item.replacement.replace(/\r\n/g, "\n");

    if (normalizedContent.includes(normalizedReplacement)) {
      console.log(`✅  Already updated: ${item.filePath}`);
      continue;
    }

    if (normalizedContent.includes(normalizedTarget)) {
      const updatedContent = normalizedContent.replace(normalizedTarget, normalizedReplacement);
      fs.writeFileSync(fullPath, updatedContent, "utf-8");
      console.log(`✍️  Updated metadata in: ${item.filePath}`);
      modifiedCount++;
    } else {
      console.log(`❌  Target pattern not found in: ${item.filePath}`);
    }
  }

  console.log(`\n🎉 Process complete. Modified ${modifiedCount} files.`);
}

run();
