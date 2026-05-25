import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.resolve(__dirname, '../prisma/dev.db');

async function main() {
  console.log("🔍 DATABASE DEBUGGER 🔍");
  console.log("======================");
  
  // 1. Check Env
  console.log(`DATABASE_URL in environment: ${process.env.DATABASE_URL}`);
  
  // 2. Check PostgreSQL row counts
  console.log("\n🐘 PostgreSQL Status:");
  const prisma = new PrismaClient();
  
  const tables = [
    { name: 'User', prismaModel: prisma.user },
    { name: 'Content', prismaModel: prisma.content },
    { name: 'Partner', prismaModel: prisma.partner },
    { name: 'Ad', prismaModel: prisma.ad },
    { name: 'Review', prismaModel: prisma.review },
    { name: 'Favorite', prismaModel: prisma.favorite },
    { name: 'Subscriber', prismaModel: prisma.subscriber },
    { name: 'PersonalizedRequest', prismaModel: prisma.personalizedRequest },
    { name: 'Download', prismaModel: prisma.download },
    { name: 'PageView', prismaModel: prisma.pageView },
    { name: 'Account', prismaModel: prisma.account },
    { name: 'Session', prismaModel: prisma.session }
  ];
  
  for (const table of tables) {
    try {
      const count = await table.prismaModel.count();
      console.log(`   📊 PostgreSQL Table ${table.name}: ${count} rows`);
    } catch (err) {
      console.log(`   ❌ PostgreSQL Table ${table.name} count failed: ${err.message}`);
    }
  }

  // 3. Dump Content Table details
  console.log("\n📝 Content Rows in PostgreSQL:");
  try {
    const contents = await prisma.content.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        published: true
      }
    });
    if (contents.length === 0) {
      console.log("   ⚠️ No content rows found in PostgreSQL.");
    } else {
      contents.forEach((c, index) => {
        console.log(`   [${index + 1}] Type: ${c.type} | Published: ${c.published} | Title: "${c.title}" | Slug: "${c.slug}"`);
      });
    }
  } catch (err) {
    console.log(`   ❌ Failed to query Content table details: ${err.message}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
