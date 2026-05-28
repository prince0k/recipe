/**
 * ============================================================
 *  VPS DATABASE SANITIZATION SCRIPT
 * ============================================================
 *  Strips all localhost / 127.0.0.1 URL prefixes from every
 *  text column in the Content table so that og:image,
 *  twitter:image, canonical, schema.org, body HTML, etc.
 *  all resolve to relative paths (which the app then turns
 *  into absolute production URLs at render time).
 *
 *  USAGE (on VPS):
 *    cd /var/www/recipe
 *    node scripts/sanitize-db-localhost-paths.js
 *
 *  USAGE (dry-run — no changes):
 *    node scripts/sanitize-db-localhost-paths.js --dry-run
 *
 *  WHAT IT DOES:
 *    1. Scans every Content record's text fields
 *    2. Replaces http(s)://localhost(:port) and
 *       http(s)://127.0.0.1(:port) with empty string
 *    3. Also scans User.image for the same pattern
 *    4. Prints a summary of what was (or would be) changed
 * ============================================================
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// ── CLI flags ──────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");

// ── Load environment ───────────────────────────────────────
try {
  const dotenv = require("dotenv");
  dotenv.config();

  // On Linux/macOS (VPS), also load .env.production if present
  const prodEnvPath = path.join(__dirname, "../.env.production");
  if (process.platform !== "win32" && fs.existsSync(prodEnvPath)) {
    console.log("📂 Loading .env.production …");
    const prodEnvConfig = dotenv.parse(fs.readFileSync(prodEnvPath));
    for (const k in prodEnvConfig) {
      process.env[k] = prodEnvConfig[k];
    }
  }
} catch (_) {
  console.log("ℹ️  dotenv not available — using process.env as-is.");
}

console.log(`\n🔗 Database URL: ${process.env.DATABASE_URL}`);
if (DRY_RUN) console.log("🧪 DRY-RUN mode — no records will be modified.\n");

const prisma = new PrismaClient();

// ── Helper: strip localhost prefixes ───────────────────────
// IMPORTANT: create a NEW regex each call to avoid lastIndex bugs
function stripLocalhost(value) {
  if (!value) return { value, changed: false };
  const cleaned = value.replace(
    /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g,
    ""
  );
  return { value: cleaned, changed: cleaned !== value };
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log("🧹 DATABASE SANITIZATION — stripping localhost / 127.0.0.1 prefixes\n");

  // ── 1. Content table ─────────────────────────────────────
  // Fields that may contain localhost URLs
  const TEXT_FIELDS = [
    "coverImage",
    "coverVideo",
    "body",
    "schema",
    "excerpt",
    "seoTitle",
    "seoDesc",
    "downloadUrl",
  ];

  const contentItems = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      coverVideo: true,
      body: true,
      schema: true,
      excerpt: true,
      seoTitle: true,
      seoDesc: true,
      downloadUrl: true,
    },
  });

  console.log(`📦 Found ${contentItems.length} Content records to scan.\n`);

  let contentUpdated = 0;
  let fieldChanges = 0;

  for (const item of contentItems) {
    let needsUpdate = false;
    const updateData = {};

    for (const field of TEXT_FIELDS) {
      const raw = item[field];
      if (!raw) continue;

      const { value: cleaned, changed } = stripLocalhost(raw);
      if (changed) {
        // Truncate long values for readable logs
        const before = raw.length > 120 ? raw.substring(0, 120) + "…" : raw;
        const after = cleaned.length > 120 ? cleaned.substring(0, 120) + "…" : cleaned;
        console.log(`  ✏️  [${field}] "${item.title}"`);
        console.log(`      BEFORE: ${before}`);
        console.log(`      AFTER : ${after}\n`);
        updateData[field] = cleaned;
        needsUpdate = true;
        fieldChanges++;
      }
    }

    if (needsUpdate && !DRY_RUN) {
      await prisma.content.update({
        where: { id: item.id },
        data: updateData,
      });
      contentUpdated++;
    } else if (needsUpdate) {
      contentUpdated++;
    }
  }

  // ── 2. User table (profile image) ────────────────────────
  let userUpdated = 0;
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true },
    });

    for (const user of users) {
      if (!user.image) continue;
      const { value: cleaned, changed } = stripLocalhost(user.image);
      if (changed) {
        const label = user.name || user.email || user.id;
        console.log(`  ✏️  [User.image] "${label}"`);
        console.log(`      BEFORE: ${user.image}`);
        console.log(`      AFTER : ${cleaned}\n`);
        if (!DRY_RUN) {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: cleaned },
          });
        }
        userUpdated++;
      }
    }
  } catch (_) {
    // User table might not have image field — safe to skip
  }

  // ── Summary ──────────────────────────────────────────────
  console.log("═".repeat(60));
  if (DRY_RUN) {
    console.log("🧪 DRY-RUN SUMMARY (no changes written):");
  } else {
    console.log("✅ SANITIZATION COMPLETE:");
  }
  console.log(`   Content records updated : ${contentUpdated}`);
  console.log(`   Individual field changes: ${fieldChanges}`);
  console.log(`   User records updated    : ${userUpdated}`);
  console.log("═".repeat(60));

  if (contentUpdated === 0 && userUpdated === 0) {
    console.log("\n🎉 Database is clean — no localhost URLs found!");
  } else if (!DRY_RUN) {
    console.log("\n⚡ Done! Now restart your app to clear cached pages:");
    console.log("   pm2 restart nutriguide");
  } else {
    console.log("\n💡 Run without --dry-run to apply these changes:");
    console.log("   node scripts/sanitize-db-localhost-paths.js");
  }
}

main()
  .catch((err) => {
    console.error("\n❌ FATAL ERROR:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
