import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const id = "cmpn77nz00001a0j4p0jrn9ky";
  console.log(`Checking content record with ID: ${id}`);

  const item = await prisma.content.findUnique({
    where: { id }
  });

  if (!item) {
    console.log("❌ Record not found in database.");
    return;
  }

  console.log("=========================================");
  console.log("RECORD DATA:");
  console.log("=========================================");
  console.log("ID:        ", item.id);
  console.log("Title:     ", item.title);
  console.log("Type:      ", item.type);
  console.log("Slug:      ", item.slug);
  console.log("Published: ", item.published);
  console.log("Tags (raw):", JSON.stringify(item.tags));
  console.log("PainPointQuestions (raw):", JSON.stringify(item.painPointQuestions));
  console.log("=========================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
