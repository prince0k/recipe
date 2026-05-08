
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recipe = await prisma.content.findFirst({
    where: { title: { contains: "Lentil Roast" } },
    select: { title: true, body: true, cookingTime: true }
  });
  if (recipe) {
    console.log("Title:", recipe.title);
    console.log("Cooking Time:", recipe.cookingTime);
    console.log("Body Snippet:", recipe.body.substring(0, 1000));
  } else {
    console.log("Not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
