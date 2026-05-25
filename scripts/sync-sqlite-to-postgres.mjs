import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🚀 Starting database synchronization: SQLite -> PostgreSQL");

  // 1. Open SQLite database
  const sqlitePath = path.resolve(__dirname, '../prisma/dev.db');
  console.log(`Reading SQLite database from: ${sqlitePath}`);
  let db;
  try {
    db = new DatabaseSync(sqlitePath);
  } catch (err) {
    console.error(`❌ Failed to open SQLite database: ${err.message}`);
    process.exit(1);
  }

  // 2. Initialize Prisma Client (which will connect to PostgreSQL via DATABASE_URL)
  const prisma = new PrismaClient();

  // Helper to get all rows from an SQLite table
  const getRows = (tableName) => {
    try {
      const query = db.prepare(`SELECT * FROM "${tableName}"`);
      return query.all();
    } catch (e) {
      console.warn(`⚠️ Warning: Could not read table ${tableName}: ${e.message}`);
      return [];
    }
  };

  // Tables to migrate in order of dependency
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

  // Disable triggers/constraints check if possible or clear tables in reverse order
  console.log("🧹 Clearing existing data in target PostgreSQL database...");
  for (const table of [...tables].reverse()) {
    try {
      await table.prismaModel.deleteMany({});
      console.log(`   Cleaned ${table.name}`);
    } catch (e) {
      console.warn(`   Failed to clean ${table.name} (continuing): ${e.message}`);
    }
  }

  // Migrate data table by table
  for (const table of tables) {
    const rows = getRows(table.name);
    console.log(`📦 Table ${table.name}: Found ${rows.length} rows in SQLite.`);

    if (rows.length === 0) continue;

    // Chunk writes to avoid hitting database limits
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      
      // Clean up fields (convert integers or null values if needed)
      const data = chunk.map(row => {
        const cleanRow = { ...row };
        
        // SQLite stores booleans as 0 or 1, but Postgres expects boolean objects
        Object.keys(cleanRow).forEach(key => {
          if (cleanRow[key] === 1 && (
            key === 'published' || 
            key === 'featured' || 
            key === 'isAnon' || 
            key === 'marketingConsent' || 
            key === 'isApproved' || 
            key === 'active'
          )) {
            cleanRow[key] = true;
          } else if (cleanRow[key] === 0 && (
            key === 'published' || 
            key === 'featured' || 
            key === 'isAnon' || 
            key === 'marketingConsent' || 
            key === 'isApproved' || 
            key === 'active'
          )) {
            cleanRow[key] = false;
          }

          // SQLite dates are stored as ISO strings or timestamps, convert to Date object
          if (key === 'createdAt' || key === 'updatedAt' || key === 'emailVerified' || key === 'expires') {
            if (cleanRow[key]) {
              cleanRow[key] = new Date(cleanRow[key]);
            }
          }
        });

        return cleanRow;
      });

      try {
        await table.prismaModel.createMany({
          data,
          skipDuplicates: true
        });
        console.log(`   Written rows ${i + 1} to ${Math.min(i + chunkSize, rows.length)} into ${table.name}`);
      } catch (err) {
        console.warn(`   ⚠️ createMany failed for ${table.name}, falling back to single inserts: ${err.message}`);
        // Fallback to individual inserts if createMany fails
        for (const item of data) {
          try {
            await table.prismaModel.create({ data: item });
          } catch (singleErr) {
            // Ignore duplicates
          }
        }
      }
    }
  }

  console.log("✅ Sync complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
