import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getGeminiResponse } from "../lib/ai";
import { sendPersonalisedPlanReadyEmail } from "../lib/email";
import { getOrCreateBoard, createPinterestPin } from "../lib/pinterest-utils";

const prisma = new PrismaClient();

async function generateIdeas() {
  console.log("🧠 Brainstorming new unique recipe and blog ideas using Gemini...");
  
  // 1. Fetch all existing titles to ensure uniqueness
  const existing = await prisma.content.findMany({
    select: { title: true }
  });
  const existingTitles = existing.map((e) => e.title);
  
  console.log(`📊 Found ${existingTitles.length} existing content items to check against.`);

  // 2. Query Gemini
  const prompt = `
You are Stewart Lucas, the expert culinary coach and nutritionist representing NutriGuide.
We want to expand our blog with 5 brand-new, unique, science-backed recipe or healthy diet/lifestyle blog post ideas.

Here is a list of our existing content titles:
${existingTitles.map((t) => `- ${t}`).join("\n")}

Please brainstorm 5 new ideas. They must be completely unique, scientifically sound, clean, and highly appealing to health/nutrition seekers.
Do not reuse or duplicate any title or exact concept from the existing list above.

Return your response strictly as a JSON array of objects. Do not include markdown formatting (like \`\`\`json), do not include any prefix or suffix, just return the raw JSON string.

Each object in the array must have:
- "title": A catchy, click-worthy, keyword-rich title for Pinterest and search engines (max 75 characters).
- "concept": A brief 2-3 sentence summary explaining the concept, the core health benefit (e.g. soy-free, gut health, weight loss), and what makes it exciting.

Format example:
[
  {
    "title": "Vibrant Citrus Avocado Summer Salad",
    "concept": "A refreshing low-carb salad combining healthy fats from avocado with zesty antioxidants from seasonal citrus. Perfect for thyroid support and morning freshness."
  }
]
`;

  let responseText: string;
  try {
    responseText = await getGeminiResponse(prompt, true);
  } catch (err: any) {
    console.error("❌ Gemini API request failed:", err.message || err);
    return;
  }

  // Clean the response just in case
  const cleanJsonText = responseText
    .replace(/```json\n?/, "")
    .replace(/\n?```/, "")
    .trim();

  let ideas: Array<{ title: string; concept: string }>;
  try {
    ideas = JSON.parse(cleanJsonText);
  } catch (err: any) {
    console.error("❌ Failed to parse Gemini response as JSON. Raw response was:\n", responseText);
    return;
  }

  if (!Array.isArray(ideas) || ideas.length === 0) {
    console.error("❌ Gemini returned an empty or invalid array structure.");
    return;
  }

  console.log(`💡 Generated ${ideas.length} ideas:`);
  
  // 3. Save to database
  const createdIds: string[] = [];
  for (const idea of ideas) {
    const saved = await prisma.pinterestIdea.create({
      data: {
        title: idea.title,
        concept: idea.concept,
        status: "PENDING"
      }
    });
    createdIds.push(saved.id);
    console.log(`  - [PENDING] ${saved.title}`);
  }

  // 4. Send email alert to admin
  const adminEmail = process.env.ADMIN_EMAIL || "prince4sharmaa123@gmail.com";
  const siteUrl = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
  const reviewUrl = `${siteUrl.replace(/\/$/, "")}/admin/pinterest/ideas`;

  console.log(`📧 Sending notification email to: ${adminEmail}...`);
  try {
    const emailResult = await sendPersonalisedPlanReadyEmail({
      to: adminEmail,
      name: "Stewart Lucas",
      viewUrl: reviewUrl
    });
    if (emailResult.success) {
      console.log(`✅ Email sent successfully! Message ID: ${emailResult.messageId}`);
    } else {
      console.warn(`⚠️ Email send reported success=false:`, emailResult.error);
    }
  } catch (err: any) {
    console.error(`❌ Failed to send review notification email:`, err.message || err);
  }

  console.log("🎉 Idea brainstorming stage complete!");
}

async function runScheduler() {
  console.log("⏰ Running Pinterest posting queue scheduler...");
  const token = process.env.PINTEREST_TOKEN;
  if (!token) {
    console.error("❌ PINTEREST_TOKEN environment variable is missing.");
    return;
  }

  // Find SCHEDULED pins ready to post
  const now = new Date();
  const pinsToPost = await prisma.pinterestPin.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: {
        lte: now
      }
    },
    include: {
      content: true
    }
  });

  if (pinsToPost.length === 0) {
    console.log("📭 No scheduled pins are ready to be posted at this time.");
    return;
  }

  console.log(`📌 Found ${pinsToPost.length} pin(s) ready for posting.`);

  for (const pin of pinsToPost) {
    try {
      console.log(`🚀 Posting Pin: "${pin.title}" to board: "${pin.boardName}"...`);

      // 1. Get or Create Board
      const boardId = await getOrCreateBoard(pin.boardName, token);

      // 2. Form image and destination link URLs
      let finalImageUrl = pin.imageUrl;
      if (pin.imageUrl.startsWith("/")) {
        const siteUrl = process.env.SITE_URL || "https://stewartlucas.com";
        finalImageUrl = `${siteUrl.replace(/\/$/, "")}${pin.imageUrl}`;
      }

      let destinationLink = process.env.SITE_URL || "https://stewartlucas.com";
      if (pin.content) {
        const pathPrefix = pin.content.type === "RECIPE" ? "recipes" : "blog";
        destinationLink = `${destinationLink.replace(/\/$/, "")}/${pathPrefix}/${pin.content.slug}`;
      }

      console.log(`  - Image URL: ${finalImageUrl}`);
      console.log(`  - Target Link: ${destinationLink}`);

      // 3. Post to Pinterest API
      const pResponse = await createPinterestPin({
        token,
        boardId,
        title: pin.title,
        description: pin.description,
        link: destinationLink,
        imageUrl: finalImageUrl
      });

      // 4. Update status in Database
      await prisma.pinterestPin.update({
        where: { id: pin.id },
        data: {
          status: "POSTED",
          postedAt: new Date(),
          pinId: pResponse.id,
          pinUrl: `https://www.pinterest.com/pin/${pResponse.id}/`
        }
      });

      console.log(`✅ Successfully posted Pin! Pin ID: ${pResponse.id}`);
    } catch (err: any) {
      console.error(`❌ Failed to post Pin "${pin.title}":`, err.message || err);
      await prisma.pinterestPin.update({
        where: { id: pin.id },
        data: {
          status: "FAILED"
          // In production, we'd log the error details in a field or logs.
        }
      });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isGenerate = args.includes("--generate-ideas");
  const isScheduler = args.includes("--run-scheduler");

  if (args.includes("--sandbox")) {
    process.env.PINTEREST_ENV = "sandbox";
  }

  if (isGenerate) {
    await generateIdeas();
  } else if (isScheduler) {
    await runScheduler();
  } else {
    console.log(`
NutriGuide Pinterest Agent CLI
==============================
Usage:
  npx tsx scripts/pinterest-agent.ts [options]

Options:
  --generate-ideas   Brainstorm 5 new unique topics, save to DB and notify admin via email.
  --run-scheduler    Publish scheduled pins whose trigger time has passed to Pinterest.
  --sandbox          Force using Pinterest Sandbox API (api-sandbox.pinterest.com).
    `);
  }
}

main()
  .catch((err) => {
    console.error("❌ Fatal Script Failure:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
