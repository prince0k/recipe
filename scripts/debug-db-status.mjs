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
  
  // 2. Check SQLite File
  console.log("\n📁 SQLite File Status:");
  if (fs.existsSync(sqlitePath)) {
    const stats = fs.statSync(sqlitePath);
    console.log(`   ✅ SQLite file exists at: ${sqlitePath}`);
    console.log(`   📏 SQLite file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`   ❌ SQLite file does NOT exist at: ${sqlitePath}`);
  }
  
  // 3. Check sqlite3 CLI
  console.log("\n💻 sqlite3 CLI Status:");
  try {
    const sqliteVersion = execSync('sqlite3 --version', { encoding: 'utf8' });
    console.log(`   ✅ sqlite3 CLI is installed: ${sqliteVersion.trim()}`);
    
    if (fs.existsSync(sqlitePath)) {
      try {
        const userCount = execSync(`sqlite3 "${sqlitePath}" "SELECT COUNT(*) FROM User"`, { encoding: 'utf8' });
        const contentCount = execSync(`sqlite3 "${sqlitePath}" "SELECT COUNT(*) FROM Content"`, { encoding: 'utf8' });
        console.log(`   📊 Rows in SQLite (via CLI) -> User: ${userCount.trim()}, Content: ${contentCount.trim()}`);
      } catch (dbErr) {
        console.log(`   ❌ Failed to query SQLite via CLI: ${dbErr.message}`);
      }
    }
  } catch (cliErr) {
    console.log(`   ❌ sqlite3 CLI is NOT installed or not in PATH: ${cliErr.message}`);
  }
  
  // 4. Check PostgreSQL row counts
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
  
  await prisma.$disconnect();
}

main().catch(console.error);
