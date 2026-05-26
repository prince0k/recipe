import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const testimonialTemplates = [
  {
    rating: 5,
    comment: "This recipe completely changed my weekend brunch! Stewart's instructions are so easy to follow, and the food styling tips made it look like a 5-star restaurant dish.",
    userEmail: "sarah.m@example.com",
    userName: "Sarah Mitchell"
  },
  {
    rating: 5,
    comment: "I've tried many keto meal plans, but this anti-inflammatory diet plan actually works. My gut feels lighter, and the energy boost by Day 4 was very real. Highly recommended!",
    userEmail: "david.k@example.com",
    userName: "David K."
  },
  {
    rating: 5,
    comment: "An absolute masterclass in clean eating. The protein cycling guide is print-friendly and has become a permanent checklist on my refrigerator door. Thank you, Stewart!",
    userEmail: "emma.watson@example.com",
    userName: "Emma Watson"
  },
  {
    rating: 4,
    comment: "Simple, honest, and incredibly delicious. Budget-friendly stakes are high here, and it actually cost me less than $15 to prep the whole sheet pan dinner.",
    userEmail: "michael.b@example.com",
    userName: "Michael B."
  },
  {
    rating: 5,
    comment: "The macro-balanced smoothie blueprint is a life-saver for busy mornings. No more guessing what to throw in my blender to stay full until lunch.",
    userEmail: "jessica.alba@example.com",
    userName: "Jessica Alba"
  }
];

async function main() {
  console.log("🚀 Seeding High-Quality Approved Testimonials & Reviews...");

  // 1. Get published content items to add reviews to
  const contents = await prisma.content.findMany({
    where: { published: true },
    select: { id: true, title: true, type: true }
  });

  if (contents.length === 0) {
    console.log("⚠️ No published content items found in the database. Please publish some content first!");
    return;
  }

  console.log(`Found ${contents.length} published content items.`);
  let addedCount = 0;

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    // Pick 1 or 2 testimonials for each item to distribute them evenly
    const countToSeed = Math.floor(Math.random() * 2) + 1; // 1 or 2 reviews
    
    for (let j = 0; j < countToSeed; j++) {
      const template = testimonialTemplates[(i + j) % testimonialTemplates.length];
      
      // Check/Upsert the reviewer user
      const reviewer = await prisma.user.upsert({
        where: { email: template.userEmail },
        update: { name: template.userName },
        create: {
          email: template.userEmail,
          name: template.userName,
          role: "USER"
        }
      });

      // Check if review already exists for this user and content
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: reviewer.id,
          contentId: content.id
        }
      });

      if (!existingReview) {
        await prisma.review.create({
          data: {
            userId: reviewer.id,
            contentId: content.id,
            rating: template.rating,
            comment: template.comment,
            isApproved: true, // Auto-approve to make them instant testimonials
          }
        });
        
        console.log(`✅ Added approved review from "${reviewer.name}" on "${content.title}" (${content.type})`);
        addedCount++;
      }
    }
  }

  // 2. Recalculate and update the Content average rating caches
  console.log("\n🔄 Updating rating caches for all content items...");
  for (const content of contents) {
    const reviews = await prisma.review.findMany({
      where: { contentId: content.id, isApproved: true },
      select: { rating: true }
    });

    if (reviews.length > 0) {
      const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.content.update({
        where: { id: content.id },
        data: { rating: average }
      });
      console.log(`   ⭐ Updated "${content.title}" rating cache to: ${average.toFixed(1)} (${reviews.length} reviews)`);
    }
  }

  console.log(`\n🏁 Testimonials seeding completed. Added ${addedCount} new approved testimonials.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
