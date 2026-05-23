import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting database cleanup...");

  // Wipe in correct order to respect foreign keys
  await prisma.emailLog.deleteMany({});
  console.log("✅ EmailLog cleared");

  await prisma.verificationToken.deleteMany({});
  console.log("✅ VerificationToken cleared");

  await prisma.session.deleteMany({});
  console.log("✅ Session cleared");

  await prisma.account.deleteMany({});
  console.log("✅ Account cleared");

  await prisma.review.deleteMany({});
  console.log("✅ Review cleared");

  await prisma.favorite.deleteMany({});
  console.log("✅ Favorite cleared");

  await prisma.personalizedRequest.deleteMany({});
  console.log("✅ PersonalizedRequest cleared");

  await prisma.subscriber.deleteMany({});
  console.log("✅ Subscriber cleared");

  await prisma.pageView.deleteMany({});
  console.log("✅ PageView cleared");

  await prisma.download.deleteMany({});
  console.log("✅ Download cleared");

  await prisma.user.deleteMany({});
  console.log("✅ User cleared");

  console.log("✨ Database cleanup complete!");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
