const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const content = await prisma.content.findUnique({
      where: { slug: '7-day-soy-free-meal-plan' }
    });
    if (!content) {
      console.log('Not found');
      return;
    }
    console.log(JSON.stringify({
      id: content.id,
      title: content.title,
      seoTitle: content.seoTitle,
      seoDesc: content.seoDesc,
      excerpt: content.excerpt,
      tags: content.tags,
      body: content.body ? content.body.substring(0, 1000) + '...' : null,
      bodyLength: content.body ? content.body.length : 0
    }, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
