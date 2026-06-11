import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to check if string contains any keywords (case-insensitive)
function matchKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

async function main() {
  console.log("Starting idempotent recipe category distribution...");

  // Fetch all recipes
  const recipes = await prisma.content.findMany({
    where: { type: "RECIPE" }
  });

  console.log(`Found ${recipes.length} recipes to analyze.`);

  // Define category tags to strip before analysis
  const categoryTags = ["breakfast", "lunch", "dinner", "veg", "non-veg", "drinks", "snacks", "desserts"];

  // Define keyword sets
  const meatKeywords = ["chicken", "beef", "meat", "pork", "steak", "fish", "salmon", "turkey", "bacon", "ribs", "lamb", "tandoori", "seafood", "shrimp", "sirloin", "tuna", "crab", "lobster", "duck"];
  const breakfastKeywords = ["breakfast", "morning", "sunrise", "smoothie bowl", "egg", "pancake", "toast", "oat", "skillet", "waffle", "crepe", "frittata", "omelet", "muffin", "loaf"];
  const lunchKeywords = ["lunch", "salad", "sandwich", "wrap", "soup", "bowl", "quinoa", "taco", "quesadilla"];
  const dinnerKeywords = ["dinner", "roast", "steak", "chicken", "salmon", "tandoori", "curry", "pasta", "stew", "skillet", "bbq", "ribs", "sirloin", "burger", "casserole", "meatballs", "bolognese", "chili"];
  const drinkKeywords = ["smoothie", "drink", "beverage", "juice", "shake", "cocktail", "tea", "coffee", "hydration", "water", "smoothies", "infusion", "latte"];
  const snackKeywords = ["snack", "snacks", "nuts", "almond", "seed", "berry", "berries", "hummus", "chip", "chips", "dip", "popcorn", "bar", "cracker", "granola"];
  const dessertKeywords = ["dessert", "desserts", "tart", "cake", "cookie", "chocolate", "pie", "sweet", "treat", "pudding", "brownie", "baking", "ganache", "custard", "mousse"];

  for (const recipe of recipes) {
    // Parse current tags
    let currentTags: string[] = [];
    try {
      if (recipe.tags) {
        currentTags = typeof recipe.tags === "string" 
          ? JSON.parse(recipe.tags) 
          : recipe.tags;
      }
    } catch (e) {
      currentTags = [];
    }

    // Strip out any existing category tags to prevent accumulation
    const baseTags = currentTags.filter(tag => !categoryTags.includes(tag.trim().toLowerCase()));

    const titleLower = recipe.title.toLowerCase();
    const tagsLower = baseTags.join(" ").toLowerCase();
    const bodyExcerptLower = `${recipe.excerpt} ${recipe.body}`.toLowerCase();

    // Determine category matches based on Title and Tags
    const newTags = new Set<string>(baseTags);

    // 1. Breakfast
    if (matchKeywords(titleLower, breakfastKeywords) || matchKeywords(tagsLower, ["breakfast", "smoothie", "toast", "oats"])) {
      newTags.add("breakfast");
    }

    // 2. Lunch
    if (matchKeywords(titleLower, lunchKeywords) || matchKeywords(tagsLower, ["lunch", "salad", "soup", "bowl"])) {
      newTags.add("lunch");
    }

    // 3. Dinner
    if (matchKeywords(titleLower, dinnerKeywords) || matchKeywords(tagsLower, ["dinner", "main", "roast", "curry"])) {
      newTags.add("dinner");
    }

    // 4. Drinks
    if (matchKeywords(titleLower, drinkKeywords) || matchKeywords(tagsLower, ["smoothie", "drinks", "beverage", "juice", "tea", "coffee"])) {
      newTags.add("drinks");
    }

    // 5. Snacks
    if (matchKeywords(titleLower, snackKeywords) || matchKeywords(tagsLower, ["snack", "snacks", "nuts", "seeds"])) {
      newTags.add("snacks");
    }

    // 6. Desserts
    if (matchKeywords(titleLower, dessertKeywords) || matchKeywords(tagsLower, ["dessert", "desserts", "sweet", "baking"])) {
      newTags.add("desserts");
    }

    // 7. Non Veg (checks if title, tags, or body mentions meat)
    const isNonVeg = matchKeywords(titleLower, meatKeywords) || 
                     matchKeywords(tagsLower, meatKeywords) || 
                     matchKeywords(bodyExcerptLower, meatKeywords);
    
    if (isNonVeg) {
      newTags.add("non-veg");
    }

    // 8. Veg (if title, tags, or body mentions plant-based, OR if it's NOT non-veg and contains veg keywords)
    const vegKeywords = ["veg", "vegetarian", "vegan", "plant-based", "lentil", "chickpea", "tofu", "tempeh", "quinoa", "avocado", "spinach", "broccoli", "fruit", "berry", "nuts", "almond", "seeds"];
    const isVegDeclared = matchKeywords(titleLower, vegKeywords) || 
                         matchKeywords(tagsLower, ["vegan", "vegetarian", "plant-based", "veg"]);
    
    // Fallback: if it has no meat keywords and matches standard vegetarian profiles
    if (!isNonVeg && (isVegDeclared || matchKeywords(titleLower, ["bowl", "loaf", "tart", "skillet", "roast", "smoothie"]))) {
      newTags.add("veg");
    }

    // Clean and convert tags back to Array
    const cleanedTags = Array.from(newTags)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    console.log(`\nRecipe: "${recipe.title}"`);
    console.log(`- Base Tags: ${JSON.stringify(baseTags)}`);
    console.log(`- Final Tags: ${JSON.stringify(cleanedTags)}`);

    // Update in database
    await prisma.content.update({
      where: { id: recipe.id },
      data: {
        tags: JSON.stringify(cleanedTags)
      }
    });
  }

  console.log("\nAll recipes processed and database updated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
