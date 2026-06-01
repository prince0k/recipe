import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

async function main() {
  console.log("🔍 NUTRIGUIDE DUPLICATE CONTENT MANAGER 🔍");
  console.log("=========================================");
  console.log(`Mode: ${dryRun ? '⚠️ DRY RUN (No database changes will be made)' : '🔥 EXECUTE (Duplicates will be permanently deleted)'}`);
  if (dryRun) {
    console.log("Tip: Run with '--execute' to apply the changes.");
  }
  console.log("-----------------------------------------");

  // 1. Fetch all content items
  const allContent = await prisma.content.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      body: true,
      createdAt: true,
      _count: {
        select: {
          downloads: true,
          favorites: true,
          reviews: true,
          personalizedRequests: true
        }
      }
    }
  });

  console.log(`Loaded ${allContent.length} content items from database.`);

  // 2. Identify duplicates
  // Group by title (trimmed, lowercased) + type
  const titleGroups: { [key: string]: typeof allContent } = {};
  // Group by body content (trimmed, lowercased) + type
  const bodyGroups: { [key: string]: typeof allContent } = {};

  allContent.forEach(item => {
    const titleKey = `${item.type}:${item.title.trim().toLowerCase()}`;
    // Use first 500 chars of body to avoid giant keys, or hash it.
    // Normalized body: strip whitespace
    const bodyNormalized = item.body ? item.body.trim().toLowerCase().replace(/\s+/g, '') : '';
    const bodyKey = bodyNormalized ? `${item.type}:${bodyNormalized}` : null;

    if (!titleGroups[titleKey]) titleGroups[titleKey] = [];
    titleGroups[titleKey].push(item);

    if (bodyKey) {
      if (!bodyGroups[bodyKey]) bodyGroups[bodyKey] = [];
      bodyGroups[bodyKey].push(item);
    }
  });

  // Track item IDs that are marked to be kept and deleted
  const keptIds = new Set<string>();
  const deleteQueue: {
    item: typeof allContent[0];
    reason: string;
    relations: { downloads: number; favorites: number; reviews: number; requests: number };
  }[] = [];

  // Helper to process a duplicate group
  const processGroup = (group: typeof allContent, criteria: string) => {
    if (group.length <= 1) return;

    // Sort items to find the best candidate to keep
    // Priority:
    // 1. Has non-cascade relation dependencies (downloads, personalizedRequests)
    // 2. Has cascade relation dependencies (reviews, favorites)
    // 3. Oldest creation date
    const sorted = [...group].sort((a, b) => {
      // Non-cascade references first (critical to avoid foreign key failures)
      const aNonCascade = a._count.downloads + a._count.personalizedRequests;
      const bNonCascade = b._count.downloads + b._count.personalizedRequests;
      if (aNonCascade !== bNonCascade) {
        return bNonCascade - aNonCascade; // Descending: items with more relations first
      }

      // Cascade references next
      const aCascade = a._count.reviews + a._count.favorites;
      const bCascade = b._count.reviews + b._count.favorites;
      if (aCascade !== bCascade) {
        return bCascade - aCascade;
      }

      // Oldest first
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const keep = sorted[0];
    keptIds.add(keep.id);

    for (let i = 1; i < sorted.length; i++) {
      const dup = sorted[i];
      // Make sure we haven't already marked this exact item for deletion or keeping
      if (!keptIds.has(dup.id) && !deleteQueue.some(d => d.item.id === dup.id)) {
        deleteQueue.push({
          item: dup,
          reason: `Duplicate of "${keep.title}" (${keep.slug}) by ${criteria}. Kept item ID: ${keep.id}`,
          relations: {
            downloads: dup._count.downloads,
            favorites: dup._count.favorites,
            reviews: dup._count.reviews,
            requests: dup._count.personalizedRequests
          }
        });
      }
    }
  };

  // Process title-based duplicates
  Object.entries(titleGroups).forEach(([key, group]) => {
    processGroup(group, "Title");
  });

  // Process body-based duplicates
  Object.entries(bodyGroups).forEach(([key, group]) => {
    processGroup(group, "Content Body similarity");
  });

  if (deleteQueue.length === 0) {
    console.log("\n✅ No duplicate content items found in the database.");
    return;
  }

  console.log(`\nFound ${deleteQueue.length} duplicate content items to delete:`);
  console.log("--------------------------------------------------------------------------------");

  // Display details of duplicates
  deleteQueue.forEach(({ item, reason, relations }) => {
    console.log(`\n❌ [DELETE] Title: "${item.title}"`);
    console.log(`   Type: ${item.type} | Slug: ${item.slug} | Created: ${item.createdAt.toISOString()}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Dependencies to clean up:`);
    console.log(`     - Downloads: ${relations.downloads}`);
    console.log(`     - Personalized Requests: ${relations.requests}`);
    console.log(`     - Favorites (cascade): ${relations.favorites}`);
    console.log(`     - Reviews (cascade): ${relations.reviews}`);
  });

  console.log("\n--------------------------------------------------------------------------------");

  if (dryRun) {
    console.log(`\n[DRY RUN SUMMARY] Would delete ${deleteQueue.length} duplicate items.`);
    console.log("No changes have been written to the database. Run with '--execute' to perform the deletions.");
  } else {
    console.log(`\nApplying deletions for ${deleteQueue.length} duplicate items...`);
    let deletedCount = 0;
    let failedCount = 0;

    for (const dup of deleteQueue) {
      try {
        // Run deletion of duplicate item in a transaction to clean up non-cascade relations first
        await prisma.$transaction(async (tx) => {
          // 1. Delete associated Downloads (non-cascade)
          if (dup.relations.downloads > 0) {
            await tx.download.deleteMany({
              where: { contentId: dup.item.id }
            });
          }

          // 2. Delete associated PersonalizedRequests (non-cascade)
          if (dup.relations.requests > 0) {
            await tx.personalizedRequest.deleteMany({
              where: { contentId: dup.item.id }
            });
          }

          // 3. Delete the Content item itself (Cascade will delete Favorites and Reviews)
          await tx.content.delete({
            where: { id: dup.item.id }
          });
        });
        
        console.log(`✅ Successfully deleted duplicate: "${dup.item.title}" (${dup.item.slug})`);
        deletedCount++;
      } catch (err: any) {
        console.error(`❌ Failed to delete duplicate "${dup.item.title}" (${dup.item.id}):`, err.message);
        failedCount++;
      }
    }

    console.log("\n=========================================");
    console.log(`DELETION SUMMARY:`);
    console.log(`   Successfully Deleted: ${deletedCount}`);
    console.log(`   Failed:               ${failedCount}`);
    console.log("=========================================");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
