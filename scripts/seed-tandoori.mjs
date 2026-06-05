import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const title = "Smoky Tandoori Chicken with Two-Step Yogurt Marinade";
const slug = "smoky-tandoori-chicken-yogurt-marinade";
const type = "RECIPE";
const excerpt = "Discover the secrets to restaurant-quality smoky tandoori chicken at home. This recipe uses a traditional two-step marination process with thick yogurt, mustard oil, and a custom spice blend to deliver tender, juicy, and beautifully charred chicken without artificial colors.";

const body = `<h2>Quick Summary</h2>
<div style='background: #F5F5DC; border: 1px solid #E0D4C3; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'>
  <ul style='margin: 0; padding-left: 20px;'>
    <li>Authentic restaurant-quality smoky flavor achieved in your home oven or air fryer.</li>
    <li>Traditional two-step marination locks in juices and infuses deep spice flavors.</li>
    <li>Naturally low-carb, gluten-free, and high in protein without any artificial food coloring.</li>
  </ul>
</div>

<h2>The Heritage of Tandoori Chicken</h2>
<p>Welcome to my kitchen, my friends! Stewart Lucas here. Today, we are taking a journey into the heart of classic Indian culinary arts. Tandoori chicken is more than just a dish—it is an experience, a legacy born from the traditional clay oven called a tandoor. Historically, this clay oven would reach blisteringly hot temperatures, roasting marinated meats quickly to lock in moisture while imparting a signature charcoal smokiness and a charred, crimson exterior.</p>
<p>But how do we capture that restaurant quality at home without a tandoor in our backyard? The secret does not lie in red food coloring, which many restaurants use. Instead, it lies in the art of the marinade. By utilizing a traditional two-step marination process and leveraging the natural heat of your home oven or air fryer, you can achieve tender, juicy chicken with beautiful charred edges that sing with deep, smoky spice notes.</p>
<p>In this recipe, we will explore the science of acid-based tenderization, the importance of thick yogurt, and the rustic magic of raw mustard oil. Together, we will elevate simple ingredients into a dish that is deeply nourishing and undeniably satisfying. Let us begin.</p>

<h2>Nutritional Science and Benefits</h2>
<div style='background: #FAF9F6; border: 1px solid #E0D4C3; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'>
  <p style='margin: 0 0 12px 0; font-weight: 600; color: #556B2F;'>Stewart's Nutrition Breakdown</p>
  <p>From a metabolic perspective, tandoori chicken is a nutritional goldmine. High-quality protein from chicken thighs or drumsticks supports muscle protein synthesis and promotes long-lasting satiety, making it an excellent anchor for clean eating or low-carb lifestyles.</p>
  <p>The yogurt marinade serves a dual purpose. Beyond acting as a gentle tenderizer due to its lactic acid content, it provides probiotics that support a healthy gut microbiome. Additionally, our spice blend is packed with anti-inflammatory compounds. Turmeric contains curcumin, a potent antioxidant, while ginger and garlic aid digestion and boost cardiovascular health. By cooking at home, we avoid industrial seed oils and artificial colors, keeping the meal clean, gluten-free, and keto-friendly.</p>
</div>

<h2>Ingredients Overview</h2>
<p>Here is your culinary palette. We divide our prep into two distinct phases to ensure the spices penetrate all the way to the bone.</p>
<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #FAF9F6; padding: 16px; border-radius: 8px; border: 1px solid #E0D4C3;'>
  <div>
    <p style='font-weight: 600; color: #8B0000; margin-top: 0;'>First Marinade</p>
    <ul style='padding-left: 20px; margin: 0;'>
      <li>2 lbs skinless chicken drumsticks/thighs</li>
      <li>1 tbsp fresh lemon juice</li>
      <li>1 tsp Kashmiri red chili powder</li>
      <li>1/2 tsp sea salt</li>
    </ul>
  </div>
  <div>
    <p style='font-weight: 600; color: #8B0000; margin-top: 0;'>Second Yogurt Marinade</p>
    <ul style='padding-left: 20px; margin: 0;'>
      <li>1/2 cup hung curd / Greek yogurt</li>
      <li>1.5 tbsp raw mustard oil</li>
      <li>1 tbsp fresh ginger paste</li>
      <li>1 tbsp fresh garlic paste</li>
      <li>1 tsp Kashmiri chili powder</li>
      <li>1/2 tsp turmeric powder</li>
      <li>1 tsp garam masala</li>
      <li>1 tsp crushed Kasuri Methi</li>
    </ul>
  </div>
</div>

<h2>Step by Step Method</h2>
<p>Follow these steps closely. The two-step marination is non-negotiable for achieving the ultimate texture and depth.</p>
<ol>
  <li><strong>Prep the Chicken:</strong> Make deep diagonal cuts on the thickest parts of the chicken legs. This allows the marinade to penetrate deep into the meat rather than just sitting on the surface. Pat the chicken completely dry with paper towels.</li>
  <li><strong>The First Marinade:</strong> Rub the chicken with the lemon juice, Kashmiri red chili powder, and sea salt. Let it rest at room temperature for 15 to 20 minutes. This acid bath begins the tenderization process and infuses the base seasoning.</li>
  <li><strong>Prepare the Yogurt Marinade:</strong> In a separate bowl, whisk together the hung curd, raw mustard oil, ginger paste, garlic paste, Kashmiri red chili powder, turmeric, garam masala, and crushed Kasuri Methi. It should form a thick, aromatic paste.</li>
  <li><strong>The Second Marinade:</strong> Coat the chicken thoroughly with the yogurt paste, massaging it into the cuts. Cover and refrigerate for at least 4 hours, or ideally overnight (up to 24 hours). The longer it rests, the more tender it becomes.</li>
  <li><strong>Roast to Perfection:</strong> Preheat your oven to 425°F (220°C). Place a wire rack over a foil-lined baking sheet. Arrange the marinated chicken on the rack, leaving space between pieces. Roast for 25 to 30 minutes, turning once halfway through.</li>
  <li><strong>The Broiler Char:</strong> Switch the oven to broil for the final 3 to 4 minutes. Watch closely as the yogurt marinade chars beautifully, creating those authentic rustic tandoor-style dark spots. Ensure the internal temperature reaches 165°F (74°C).</li>
  <li><strong>Rest and Garnish:</strong> Let the chicken rest for 5 minutes to lock in juices. Garnish with a pinch of chaat masala, sliced red onions, and fresh lemon wedges before serving.</li>
</ol>

<h2>Stewart's Secret Coaching Tips</h2>
<div style='background: #F5F5DC; border-left: 4px solid #8B0000; padding: 16px 20px; margin: 24px 0; border-radius: 8px;'>
  <p style='margin: 0 0 8px 0; font-weight: 600; color: #B35412;'>Professional Coaching Insights</p>
  <p>To truly achieve that authentic flavor, follow these professional secrets:</p>
  <ul style='margin-top: 8px; padding-left: 20px;'>
    <li><span style='display: inline-block; background: #FAF9F6; color: #8B0000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #E0D4C3;'>The Oil Secret</span> Use raw, unheated mustard oil in the second marinade. It contains volatile compounds that provide a characteristic smoky, pungent undertone that cannot be replicated by any other oil.</li>
    <li><span style='display: inline-block; background: #FAF9F6; color: #8B0000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #E0D4C3;'>Hung Curd</span> Make sure your yogurt is thick. If using standard yogurt, strain it in cheesecloth for 2 hours to remove whey. If the marinade is too runny, it will slip off the chicken during roasting instead of forming a delicious spice crust.</li>
    <li><span style='display: inline-block; background: #FAF9F6; color: #8B0000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #E0D4C3;'>Dry the Meat</span> Always pat the chicken completely dry before the first marination. Excess moisture dilutes the acid and spices, leading to soggy, steamed meat rather than beautifully roasted chicken.</li>
  </ul>
</div>

<h2>Meal Prep and Storage Guide</h2>
<p>This dish is exceptionally friendly for meal prepping and batch cooking.</p>
<p><strong>Refrigeration:</strong> Store leftover cooked chicken in an airtight container for up to 4 days. To reheat, place the chicken in a preheated oven or toaster oven at 350°F (175°C) for 10 minutes, or air-fry at 360°F (180°C) for 4 to 5 minutes. Avoid the microwave if you want to preserve the crisp, roasted texture.</p>
<p><strong>Freezing:</strong> You can freeze the chicken after the second marination before cooking! Place the marinated raw chicken in a freezer-safe zip bag and freeze for up to 3 months. Thaw in the refrigerator overnight before baking as directed.</p>

<h2>Variations and Swaps</h2>
<p>Embrace flexibility and adapt the recipe to suit your dietary preferences:</p>
<ul style='padding-left: 20px;'>
  <li><strong>Vegetarian Swap:</strong> Substitute chicken with firm paneer cubes or extra firm pressed tofu. Reduce the marination time to 1 hour and bake for only 15 to 20 minutes.</li>
  <li><strong>Boneless Chicken:</strong> You can use boneless chicken breast or thigh chunks. Thread them onto skewers to make Tandoori Tikka, and roast for 15 to 18 minutes.</li>
  <li><strong>Dairy Free Option:</strong> Swap Greek yogurt for a thick, unsweetened coconut yogurt. Add a teaspoon of lemon juice to mimic the natural tang of dairy yogurt.</li>
  <li><strong>Mustard Oil Substitute:</strong> If mustard oil is unavailable, you can substitute it with avocado oil or neutral vegetable oil mixed with a tiny drop of sesame oil.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<details>
  <summary>Do I need a tandoor oven to make this recipe?</summary>
  <p>No, you do not. A home oven preheated to a high temperature (425°F) combined with a final broiling step replicates the dry, intense heat and char of a tandoor remarkably well. An air fryer is also an excellent option.</p>
</details>
<details>
  <summary>Can I skip the first marination step?</summary>
  <p>I highly recommend you do not. The first marination allows the lemon juice and salt to penetrate the fibers first. This helps tenderize the chicken deeply, ensuring the second marination's spices cling to flavorful, seasoned meat.</p>
</details>
<details>
  <summary>Is raw mustard oil safe to consume?</summary>
  <p>Mustard oil is widely used as a culinary cooking fat in South Asia. If you are concerned about its pungency, you can heat it to smoking point and let it cool before adding to the marinade, though raw oil provides the most authentic flavor profile.</p>
</details>
<details>
  <summary>How do I prevent the chicken from drying out?</summary>
  <p>Using bone-in chicken thighs and drumsticks is the best insurance against dry meat, as they contain enough healthy fat and connective tissue to stay juicy. Additionally, do not overcook past an internal temperature of 165°F.</p>
</details>`;

const coverImage = "/uploads/images/1780666191101-smoky-tandoori-chicken-yogurt-marinade.webp";
const coverImagePrompt = "Professional food photography of smoky tandoori chicken. Overhead vertical shot with 2:3 aspect ratio. Charred tandoori chicken legs on a rustic dark platter, garnished with lemon wedges, red onion rings, and fresh cilantro leaves. Styled for Pinterest with rich warm tones, cozy lighting, and a side of green chutney.";

const ingredients = [
  "## Chicken Prep & First Marinade:",
  "2 lbs (approx. 900g) skinless chicken drumsticks or thighs",
  "1 tablespoon lemon juice (freshly squeezed)",
  "1 teaspoon Kashmiri red chili powder",
  "1/2 teaspoon fine sea salt",
  "## Second Yogurt Marinade:",
  "1/2 cup hung curd or thick Greek yogurt",
  "1.5 tablespoons mustard oil (raw, unheated)",
  "1 tablespoon ginger paste (freshly grated)",
  "1 tablespoon garlic paste (freshly grated)",
  "1 teaspoon Kashmiri red chili powder",
  "1/2 teaspoon turmeric powder",
  "1 teaspoon Garam Masala",
  "1 teaspoon Kasuri Methi (dried fenugreek leaves, crushed)",
  "1/2 teaspoon chaat masala (optional, for finishing)"
];

const tags = ["Dinner", "Gluten Free", "Healthy Eating", "Indian", "Keto"];

const recipeData = {
  type,
  title,
  slug,
  excerpt,
  body,
  coverImage,
  coverImagePrompt,
  ingredients: JSON.stringify(ingredients),
  cookingTime: "30 mins",
  prepTime: "20 mins",
  difficulty: "Medium",
  calories: 380,
  fat: "22g",
  carbs: "6g",
  protein: "38g",
  servings: 6,
  seoTitle: "Smoky Tandoori Chicken Recipe | NutriGuide",
  seoDesc: "Make restaurant-quality smoky tandoori chicken at home using a traditional two-step marination. Low-carb, gluten-free, and high-protein recipe.",
  keywords: JSON.stringify(tags),
  tags: JSON.stringify(tags),
  published: true,
  featured: false,
};

async function main() {
  console.log("Upserting Smoky Tandoori Chicken recipe into database...");

  const prepTimeStr = "PT20M";
  const cookTimeStr = "PT30M";
  const totalTimeStr = "PT50M";

  // Filter headers out for schema
  const schemaIngredients = ingredients.filter(item => !item.startsWith("##") && !item.endsWith(":"));

  const generatedSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": title,
    "description": excerpt,
    "image": [
      `https://stewartlucas.com${coverImage}`
    ],
    "author": {
      "@type": "Person",
      "name": "Stewart Lucas",
      "url": "https://stewartlucas.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NutriGuide by Stewart Lucas",
      "url": "https://stewartlucas.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://stewartlucas.com/assets/og-image.jpg"
      }
    },
    "url": `https://stewartlucas.com/recipes/${slug}`,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "prepTime": prepTimeStr,
    "cookTime": cookTimeStr,
    "totalTime": totalTimeStr,
    "recipeYield": "6 servings",
    "recipeCategory": "Dinner",
    "recipeCuisine": "Indian",
    "keywords": tags.join(", "),
    "recipeIngredient": schemaIngredients,
    "recipeInstructions": [
      { "@type": "HowToStep", "position": 1, "text": "Prep the Chicken: Make deep diagonal cuts on the thickest parts of the chicken legs. Pat the chicken completely dry." },
      { "@type": "HowToStep", "position": 2, "text": "The First Marinade: Rub the chicken with the lemon juice, Kashmiri red chili powder, and sea salt. Let it rest for 15 to 20 minutes." },
      { "@type": "HowToStep", "position": 3, "text": "Prepare the Yogurt Marinade: Whisk together hung curd, raw mustard oil, ginger, garlic, Kashmiri chili powder, turmeric, garam masala, and crushed Kasuri Methi." },
      { "@type": "HowToStep", "position": 4, "text": "The Second Marinade: Coat chicken thoroughly with yogurt paste, massaging it into cuts. Refrigerate for at least 4 hours or overnight." },
      { "@type": "HowToStep", "position": 5, "text": "Roast: Preheat oven to 425°F (220°C). Roast arrangement on a wire rack over foil-lined baking sheet for 25 to 30 minutes." },
      { "@type": "HowToStep", "position": 6, "text": "Broil: Switch oven to broil for final 3 to 4 minutes to achieve rustic tandoor-style dark charred spots." },
      { "@type": "HowToStep", "position": 7, "text": "Rest and Serve: Rest chicken for 5 minutes. Garnish with chaat masala, sliced onions, and lemon wedges." }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "2",
      "bestRating": "5",
      "worstRating": "1"
    },
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": "380 calories",
      "proteinContent": "38g",
      "fatContent": "22g",
      "carbohydrateContent": "6g"
    }
  };

  const finalRecipeData = {
    ...recipeData,
    schema: JSON.stringify(generatedSchema, null, 2)
  };

  const result = await prisma.content.upsert({
    where: { slug },
    update: finalRecipeData,
    create: finalRecipeData,
  });

  console.log("✅ Recipe upserted successfully: ", result.title, "(ID:", result.id, ")");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding recipe:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
