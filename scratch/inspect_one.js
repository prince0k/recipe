
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recipe = await prisma.content.findFirst({
    where: { type: 'RECIPE' },
    select: { title: true, body: true, cookingTime: true }
  });
  console.log("Title:", recipe.title);
  console.log("Cooking Time:", recipe.cookingTime);
  console.log("Body Snippet:", recipe.body.substring(0, 500));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
