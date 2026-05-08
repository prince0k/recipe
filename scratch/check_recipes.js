
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.content.findMany({
    where: { type: 'RECIPE' },
    select: { id: true, title: true, cookingTime: true, tags: true }
  });
  console.log(JSON.stringify(recipes, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
