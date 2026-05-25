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
      
      // Clean up fields (casing, booleans, dates)
      const data = chunk.map(row => {
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
