import { getGeminiResponse } from "./ai";
import { prisma } from "./db";

export async function extractDishesFromMealPlan(mealPlanTitle: string, mealPlanBody: string) {
  const prompt = `
You are an expert nutritionist helper. 
I have a meal plan titled "${mealPlanTitle}". Here is the meal plan content:
${mealPlanBody}

Please extract a list of all unique dishes, meals, or recipes mentioned in this meal plan that require a recipe to cook.
For example, extract dishes like "Mushroom egg white omelet", "Quinoa salad with chickpeas", "Roasted chicken with asparagus", "Lentil soup with garden vegetables", "Baked tempeh".
Do not extract simple single-ingredient snacks like "Raw almonds", "Pistachios", "Edamame", "Banana", "Water", "Coffee", or "Protein powder" unless they are part of a cooked dish.

Format your response as a JSON array of strings containing only the dish names.
Example:
[
  "Mushroom Egg White Omelet",
  "Quinoa Salad with Chickpeas",
  "Roasted Chicken with Asparagus",
  "Lentil Soup with Garden Vegetables",
  "Baked Tempeh with Broccoli"
]
`;

  try {
    const aiResponse = await getGeminiResponse(prompt, true);
    const dishes: string[] = JSON.parse(aiResponse || "[]");
    return Array.isArray(dishes) ? dishes : [];
  } catch (err) {
    console.error("Failed to extract dishes from meal plan:", err);
    return [];
  }
}

export async function processMealPlanDishes(contentId: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content || content.type !== "DIET_PLAN" || !content.body) return;

    const dishes = await extractDishesFromMealPlan(content.title, content.body);
    console.log(`Extracted ${dishes.length} dishes from meal plan "${content.title}"`);

    for (const dish of dishes) {
      const slug = dish.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      // Check if a recipe or pending recipe already exists with this title/slug
      const existing = await prisma.content.findFirst({
        where: {
          OR: [
            { title: dish },
            { slug: slug },
            { slug: `${slug}-pending` }
          ]
        }
      });
      
      if (!existing) {
        await prisma.content.create({
          data: {
            title: dish,
            slug: `${slug}-pending`,
            type: "PENDING_RECIPE",
            excerpt: `Pending recipe extracted from: ${content.title}`,
            body: "",
            published: false,
            tags: JSON.stringify(["Pending"]),
          }
        });
        console.log(`Created pending recipe: ${dish}`);
      }
    }
  } catch (err) {
    console.error("Error processing meal plan dishes:", err);
  }
}
