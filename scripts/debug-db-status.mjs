import { PrismaClient } from '@prisma/client';

async function main() {
  console.log("🔍 DATABASE DEBUGGER 🔍");
  console.log("======================");
  console.log(`DATABASE_URL in environment: ${process.env.DATABASE_URL}`);
  
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
      console.log(`📊 Table ${table.name}: ${count} rows`);
    } catch (err) {
      console.log(`❌ Table ${table.name} count failed: ${err.message}`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
