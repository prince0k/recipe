const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const content = await prisma.content.findFirst({
    where: {
      type: 'DIET_PLAN',
      slug: { contains: 'soy' }
    },
    select: {
      id: true,
      slug: true,
      title: true,
      seoTitle: true,
      seoDesc: true,
      keywords: true,
      tags: true,
      excerpt: true,
      body: false  // too large to print
    }
  });

  if (content) {
    console.log('=== FOUND CONTENT ===');
    console.log('ID:', content.id);
    console.log('SLUG:', content.slug);
    console.log('TITLE:', content.title);
    console.log('SEO TITLE:', content.seoTitle);
    console.log('SEO DESC:', content.seoDesc);
    console.log('KEYWORDS:', content.keywords);
    console.log('TAGS:', content.tags);
    console.log('EXCERPT:', content.excerpt?.substring(0, 300));
  } else {
    // Try broader search
    const all = await prisma.content.findMany({
      where: { type: 'DIET_PLAN' },
      select: { id: true, slug: true, title: true }
    });
    console.log('All diet plans:', JSON.stringify(all, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
