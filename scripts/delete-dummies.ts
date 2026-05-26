import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 DATABASE CLEANUP: Deleting dummy generated items...");

  // Delete all Content items where title contains "Generated Content"
  const deleted = await prisma.content.deleteMany({
    where: {
      title: {
        contains: "Generated Content"
      }
    }
  });

  console.log(`✅ Successfully deleted ${deleted.count} dummy content items from the Content table.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
