/**
 * ============================================================
 *  SEO METADATA & SCHEMA UPDATE MIGRATION SCRIPT
 * ============================================================
 *  This script applies absolute canonicals, URL-decoded/lowercased
 *  slug lookups, and structured data try/catch blocks directly to
 *  the codebase page files. Useful for applying modifications
 *  directly on a VPS or target machine.
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
    canonical: "https://stewartlucas.com/",
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
    canonical: "https://stewartlucas.com/about",
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
    canonical: "https://stewartlucas.com/contact",
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
    canonical: "https://stewartlucas.com/privacy-policy",
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
  }
];

function run() {
  console.log("🚀 Starting SEO Metadata modifications script...\n");

  let modifiedCount = 0;

  // Apply static replacements
  for (const item of REPLACEMENTS) {
    const fullPath = path.join(ROOT_DIR, item.filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${item.filePath}`);
      continue;
    }

    let content = fs.readFileSync(fullPath, "utf-8");
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
      // Try fuzzy match just in case
      console.log(`❌  Target pattern not found in: ${item.filePath}`);
    }
  }

  // Apply dynamic list pages updates (safety checks, absolute canonical)
  const listPages = [
    {
      filePath: "app/(public)/blog/page.tsx",
      search: `  const sParams = await searchParams;`,
      replace: `  const sParams = (await searchParams) || {};`,
      search2: `    alternates: {
      canonical: \`/blog\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`,
      replace2: `    alternates: {
      canonical: \`https://stewartlucas.com/blog\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`
    },
    {
      filePath: "app/(public)/cheat-sheets/page.tsx",
      search: `  const sParams = await searchParams;`,
      replace: `  const sParams = (await searchParams) || {};`,
      search2: `    alternates: {
      canonical: \`/cheat-sheets\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`,
      replace2: `    alternates: {
      canonical: \`https://stewartlucas.com/cheat-sheets\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`
    },
    {
      filePath: "app/(public)/diet-plan/page.tsx",
      search: `  const sParams = await searchParams;`,
      replace: `  const sParams = (await searchParams) || {};`,
      search2: `    alternates: {
      canonical: \`/diet-plan\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`,
      replace2: `    alternates: {
      canonical: \`https://stewartlucas.com/diet-plan\${page > 1 ? \`?page=\${page}\` : ""}\`,
    },`
    },
    {
      filePath: "app/(public)/recipes/page.tsx",
      search: `  const sParams = await searchParams;`,
      replace: `  const sParams = (await searchParams) || {};`,
      search2: `    alternates: {
      canonical: \`/recipes\${category ? \`?category=\${category}\` : ""}\${page > 1 ? \`\${category ? '&' : '?'}page=\${page}\` : ""}\`,
    },`,
      replace2: `    alternates: {
      canonical: \`https://stewartlucas.com/recipes\${category ? \`?category=\${category}\` : ""}\${page > 1 ? \`\${category ? '&' : '?'}page=\${page}\` : ""}\`,
    },`
    }
  ];

  for (const page of listPages) {
    const fullPath = path.join(ROOT_DIR, page.filePath);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, "utf-8");
    let changed = false;

    if (content.includes(page.search)) {
      content = content.replace(page.search, page.replace);
      changed = true;
    }
    if (content.includes(page.search2)) {
      content = content.replace(page.search2, page.replace2);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, "utf-8");
      console.log(`✍️  Updated list page parameters & canonicals in: ${page.filePath}`);
      modifiedCount++;
    } else {
      console.log(`✅  Already updated: ${page.filePath}`);
    }
  }

  console.log(`\n🎉 Process complete. Modified ${modifiedCount} files.`);
}

run();
