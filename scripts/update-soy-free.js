const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function run() {
  try {
    const scratchDir = path.join(__dirname, '../scratch');
    
    const bodyPath = path.join(scratchDir, 'soy-free-body.html');
    const schemaPath = path.join(scratchDir, 'soy-free-schema.json');
    const contentPath = path.join(scratchDir, 'soy-free-content.json');
    
    if (!fs.existsSync(bodyPath) || !fs.existsSync(schemaPath) || !fs.existsSync(contentPath)) {
      console.error('Error: one or more scratch files missing');
      return;
    }
    
    const bodyContent = fs.readFileSync(bodyPath, 'utf8');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const metadata = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    
    console.log('Updating database entry for 7-day-soy-free-meal-plan...');
    
    const updated = await prisma.content.update({
      where: { slug: '7-day-soy-free-meal-plan' },
      data: {
        title: metadata.title,
        seoTitle: metadata.seoTitle,
        seoDesc: metadata.seoDesc,
        excerpt: metadata.excerpt,
        tags: metadata.tags,
        body: bodyContent,
        schema: JSON.stringify(JSON.parse(schemaContent)) // Minify the JSON schema string
      }
    });
    
    console.log('Database updated successfully for ID:', updated.id);
  } catch (error) {
    console.error('Error during database update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
