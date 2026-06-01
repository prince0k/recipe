import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  title: string;
  type: string;
  slug: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  errors: string[];
  warnings: string[];
}

function parseMinutes(timeStr: string | null): number | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

async function main() {
  console.log("🔍 SCHEMA VALIDATOR & SANITY CHECKER 🔍");
  console.log("======================================\n");

  const items = await prisma.content.findMany({
    include: {
      reviews: {
        where: { isApproved: true }
      }
    }
  });

  console.log(`Found ${items.length} content items in database to validate.\n`);

  const results: ValidationResult[] = [];

  for (const item of items) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse Tags
    let tags: string[] = [];
    try {
      tags = JSON.parse(item.tags || '[]');
    } catch {
      warnings.push("Tags field is not valid JSON.");
    }

    // 1. Retrieve the schema to validate
    let schemaObj: any = null;
    if (item.schema) {
      try {
        schemaObj = JSON.parse(item.schema);
      } catch (e) {
        errors.push(`Failed to parse schema column JSON: ${(e as Error).message}`);
      }
    }

    // If no schema in DB, simulate the runtime schema based on the rendering logic
    if (!schemaObj) {
      warnings.push("No stored schema override in database. Validating runtime-generated schema.");
      
      const cleanCover = item.coverImage
        ? item.coverImage.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, '')
        : '/assets/og-image.jpg';
      const baseImageUrl = cleanCover.startsWith('http')
        ? cleanCover
        : `https://stewartlucas.com${cleanCover.startsWith('/') ? '' : '/'}${cleanCover}`;

      if (item.type === 'RECIPE') {
        const parsedPrep = (() => {
          if (typeof item.prepTime === 'number') return item.prepTime;
          if (typeof item.prepTime === 'string') {
            const match = item.prepTime.match(/\d+/);
            return match ? parseInt(match[0], 10) : undefined;
          }
          return undefined;
        })();
        const parsedCook = (() => {
          if (typeof item.cookingTime === 'number') return item.cookingTime;
          if (typeof item.cookingTime === 'string') {
            const match = item.cookingTime.match(/\d+/);
            return match ? parseInt(match[0], 10) : undefined;
          }
          return undefined;
        })();
        const prepTimeMinutes = parsedPrep || 15;
        const durationMinutes = parsedCook || 25;

        const reviewCount = item.reviews.length;
        const avgRating = reviewCount > 0 
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
          : 0;

        const category = tags.find((t: string) => ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(t.toLowerCase())) || 'Main Course';
        const cuisine = tags.find((t: string) => ['mediterranean', 'american', 'italian', 'mexican', 'asian', 'french', 'greek'].includes(t.toLowerCase())) || 'Healthy';

        schemaObj = {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": item.title,
          "image": [baseImageUrl],
          "prepTime": `PT${prepTimeMinutes}M`,
          "cookTime": `PT${durationMinutes}M`,
          "recipeCategory": category.charAt(0).toUpperCase() + category.slice(1),
          "recipeCuisine": cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": reviewCount > 0 ? avgRating.toFixed(1) : (item.rating > 0 ? item.rating.toFixed(1) : "5.0"),
            "ratingCount": reviewCount > 0 ? reviewCount : 2
          }
        };
      } else {
        // Blog/Cheat Sheet/Diet Plan
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": item.title,
          "image": [baseImageUrl],
          "author": {
            "@type": "Person",
            "name": "Stewart Lucas"
          },
          "publisher": {
            "@type": "Organization",
            "name": "NutriGuide"
          }
        };
      }
    }

    // 2. Validate JSON-LD
    if (schemaObj) {
      // Handle array or object structure
      const schemasToValidate = Array.isArray(schemaObj) ? schemaObj : [schemaObj];

      for (const sc of schemasToValidate) {
        if (!sc["@context"]) {
          errors.push("Missing '@context' property.");
        }
        if (!sc["@type"]) {
          errors.push("Missing '@type' property.");
        }

        // Image Validation
        const images = Array.isArray(sc.image) ? sc.image : (sc.image ? [sc.image] : []);
        if (images.length === 0) {
          errors.push("Missing representative 'image' URL.");
        } else {
          images.forEach((imgUrl: string) => {
            if (typeof imgUrl !== 'string') {
              errors.push(`Invalid image type: expected string, got ${typeof imgUrl}.`);
            } else {
              if (imgUrl.includes("localhost") || imgUrl.includes("127.0.0.1")) {
                errors.push(`Image URL contains local environment domain: "${imgUrl}".`);
              }
              if (!imgUrl.startsWith("http://") && !imgUrl.startsWith("https://")) {
                errors.push(`Image URL is relative or not absolute: "${imgUrl}".`);
              }
            }
          });
        }

        // Recipe Validation
        if (item.type === 'RECIPE' || sc["@type"] === 'Recipe') {
          // Prep/Cook Time
          if (!sc.prepTime) {
            warnings.push("Missing recommended 'prepTime'.");
          } else if (!/^PT\d+M$/.test(sc.prepTime)) {
            errors.push(`Invalid 'prepTime' ISO 8601 duration format: "${sc.prepTime}". Expected e.g. "PT15M".`);
          }

          if (!sc.cookTime) {
            warnings.push("Missing recommended 'cookTime'.");
          } else if (!/^PT\d+M$/.test(sc.cookTime)) {
            errors.push(`Invalid 'cookTime' ISO 8601 duration format: "${sc.cookTime}". Expected e.g. "PT25M".`);
          }

          // Category/Cuisine
          if (!sc.recipeCategory) {
            warnings.push("Missing recommended 'recipeCategory'.");
          } else if (sc.recipeCategory[0] !== sc.recipeCategory[0].toUpperCase()) {
            warnings.push(`Casing warning: 'recipeCategory' should preferably be capitalized ("${sc.recipeCategory}").`);
          }

          if (!sc.recipeCuisine) {
            warnings.push("Missing recommended 'recipeCuisine'.");
          } else if (sc.recipeCuisine[0] !== sc.recipeCuisine[0].toUpperCase()) {
            warnings.push(`Casing warning: 'recipeCuisine' should preferably be capitalized ("${sc.recipeCuisine}").`);
          }

          // Ratings
          if (!sc.aggregateRating) {
            warnings.push("Missing recommended 'aggregateRating'.");
          } else {
            const rating = sc.aggregateRating;
            if (rating["@type"] !== "AggregateRating") {
              errors.push("aggregateRating is missing correct '@type': 'AggregateRating'.");
            }
            if (!rating.ratingValue) {
              errors.push("Missing aggregateRating.ratingValue.");
            }
            if (!rating.reviewCount) {
              errors.push("Missing aggregateRating.reviewCount.");
            }
          }
        }

        // Blog / Article Validation
        if (sc["@type"] === 'BlogPosting' || sc["@type"] === 'Article') {
          if (!sc.headline && !sc.name) {
            errors.push("Missing 'headline' or 'name' property.");
          }
          if (!sc.author) {
            errors.push("Missing 'author' property.");
          } else if (sc.author["@type"] !== "Person" && sc.author.type !== "Person") {
            warnings.push("Recommended: 'author' should specify type 'Person'.");
          }
          if (!sc.publisher) {
            warnings.push("Recommended: Missing 'publisher' property.");
          }
        }
      }
    }

    const status = errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'WARNING' : 'PASS');
    results.push({
      title: item.title,
      type: item.type,
      slug: item.slug,
      status,
      errors,
      warnings
    });
  }

  // Display report
  console.log("📋 REPORT CARD SUMMARY 📋");
  console.log("------------------------");
  const passed = results.filter(r => r.status === 'PASS');
  const warned = results.filter(r => r.status === 'WARNING');
  const failed = results.filter(r => r.status === 'FAIL');

  console.log(`🟢 PASS:    ${passed.length}`);
  console.log(`🟡 WARNING: ${warned.length}`);
  console.log(`🔴 FAIL:    ${failed.length}\n`);

  if (failed.length > 0) {
    console.log("🔴 CRITICAL ERRORS FOUND:");
    failed.forEach(r => {
      console.log(`\n❌ [${r.type}] "${r.title}" (slug: /${r.slug})`);
      r.errors.forEach(e => console.log(`   - Error: ${e}`));
      r.warnings.forEach(w => console.log(`   - Warning: ${w}`));
    });
  }

  if (warned.length > 0) {
    console.log("\n🟡 WARNINGS / RECOMMENDATIONS FOUND:");
    warned.forEach(r => {
      console.log(`\n⚠️ [${r.type}] "${r.title}"`);
      r.warnings.forEach(w => console.log(`   - Warning: ${w}`));
    });
  }

  if (failed.length === 0) {
    console.log("\n✅ All schemas are fully compliant! No hard errors blocking Google Search rich snippets.");
  }
}

main().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
