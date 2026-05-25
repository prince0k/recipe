import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.resolve(__dirname, '../prisma/dev.db');

// Simple CSV parser supporting quotes and escaped values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = parseCSVLine(line);
    const obj = {};
    
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : null;
      if (val === 'null' || val === 'NULL' || val === '') {
        val = null;
      } else if (val !== null && !isNaN(val) && val.trim() !== '') {
        val = Number(val);
      }
      obj[header] = val;
    });
    result.push(obj);
  }
  return result;
}

// Helper to get all rows from SQLite using CLI
function getRows(tableName) {
  try {
    // 1. Try -json option (modern SQLite versions)
    const stdout = execSync(`sqlite3 -json "${sqlitePath}" "SELECT * FROM \\"${tableName}\\""`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024
    });
    return JSON.parse(stdout || '[]');
  } catch (err) {
    try {
      // 2. Fallback to -csv mode (supported on all SQLite versions)
      const stdout = execSync(`sqlite3 -csv -header "${sqlitePath}" "SELECT * FROM \\"${tableName}\\""`, {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });
      return parseCSV(stdout);
    } catch (csvErr) {
      console.error(`   ❌ Failed to retrieve table ${tableName}: ${csvErr.message}`);
      return [];
    }
  }
}

async function main() {
  console.log("🚀 Starting database synchronization: SQLite -> PostgreSQL (Node 20 Compatible)");
  console.log(`Reading SQLite database from: ${sqlitePath}`);

  // Initialize Prisma Client (uses PostgreSQL connection string from environment)
  const prisma = new PrismaClient();

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

  console.log("ℹ️ Merging SQLite data into PostgreSQL without clearing existing database...");

  // Helper to merge a single row safely
  async function mergeRow(tableName, prismaModel, item) {
    try {
      if (tableName === 'User') {
        const existing = await prismaModel.findFirst({
          where: {
            OR: [
              { id: item.id },
              { email: item.email }
            ]
          }
        });
        if (existing) {
          const { id, email, ...updateData } = item;
          await prismaModel.update({
            where: { id: existing.id },
            data: updateData
          });
          return 'updated';
        }
      } else if (tableName === 'Content') {
        const existing = await prismaModel.findFirst({
          where: {
            OR: [
              { id: item.id },
              { slug: item.slug }
            ]
          }
        });
        if (existing) {
          const { id, slug, ...updateData } = item;
          await prismaModel.update({
            where: { id: existing.id },
            data: updateData
          });
          return 'updated';
        }
      } else if (tableName === 'Account') {
        const existing = await prismaModel.findUnique({
          where: {
            provider_providerAccountId: {
              provider: item.provider,
              providerAccountId: item.providerAccountId
            }
          }
        });
        if (existing) return 'skipped';
      } else if (tableName === 'Session') {
        const existing = await prismaModel.findUnique({
          where: { sessionToken: item.sessionToken }
        });
        if (existing) return 'skipped';
      } else if (tableName === 'Favorite') {
        const existing = await prismaModel.findUnique({
          where: {
            userId_contentId: {
              userId: item.userId,
              contentId: item.contentId
            }
          }
        });
        if (existing) return 'skipped';
      } else {
        // General check by ID for other tables
        if (item.id) {
          const existing = await prismaModel.findUnique({
            where: { id: item.id }
          });
          if (existing) return 'skipped';
        }
      }

      await prismaModel.create({ data: item });
      return 'created';
    } catch (err) {
      console.warn(`   ⚠️ Failed to merge row in ${tableName} (${item.id || item.email || 'unknown'}): ${err.message}`);
      return 'failed';
    }
  }

  // Migrate data table by table
  for (const table of tables) {
    const rows = getRows(table.name);
    console.log(`📦 Table ${table.name}: Found ${rows.length} rows in SQLite.`);

    if (rows.length === 0) continue;

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      // Clean up fields (casing, booleans, dates)
      const cleanRow = { ...row };
      
      Object.keys(cleanRow).forEach(key => {
        // Convert SQLite 1/0 to Boolean
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

      const status = await mergeRow(table.name, table.prismaModel, cleanRow);
      if (status === 'created') createdCount++;
      else if (status === 'updated') updatedCount++;
      else if (status === 'skipped') skippedCount++;
      else if (status === 'failed') failedCount++;
    }

    console.log(`   ✨ ${table.name} Sync Report: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed.`);
  }

  console.log("✅ Sync complete!");
  await prisma.$disconnect();
}

main().catch(console.error);
