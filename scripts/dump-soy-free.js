const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
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
    
    const outputDir = path.join(__dirname, '../scratch');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    fs.writeFileSync(path.join(outputDir, 'soy-free-body.html'), content.body || '');
    fs.writeFileSync(path.join(outputDir, 'soy-free-schema.json'), content.schema || '');
    fs.writeFileSync(path.join(outputDir, 'soy-free-content.json'), JSON.stringify({
      title: content.title,
      seoTitle: content.seoTitle,
      seoDesc: content.seoDesc,
      excerpt: content.excerpt,
      tags: content.tags,
    }, null, 2));
    
    console.log('Successfully dumped all database content to scratch/');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
