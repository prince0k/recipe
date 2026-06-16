import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse } from "@/lib/ai";
import { sendPinterestAlertEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧠 Brainstorming new unique recipe/blog ideas via Web Admin request...");

    // 1. Fetch existing titles
    const existing = await prisma.content.findMany({
      select: { title: true }
    });
    const existingTitles = existing.map(e => e.title);

    // 2. Query Gemini
    const prompt = `
You are Stewart Lucas, the expert culinary coach and nutritionist representing NutriGuide.
We want to expand our blog with 5 brand-new, unique, science-backed recipe or healthy diet/lifestyle blog post ideas.

Here is a list of our existing content titles:
${existingTitles.map(t => `- ${t}`).join("\n")}

Please brainstorm 5 new ideas. They must be completely unique, scientifically sound, clean, and highly appealing to health/nutrition seekers.
Do not reuse or duplicate any title or exact concept from the existing list above.

Return your response strictly as a JSON array of objects. Do not include markdown formatting (like \`\`\`json), just return the raw JSON string.

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

    const responseText = await getGeminiResponse(prompt, true);
    const cleanJsonText = responseText
      .replace(/```json\n?/, "")
      .replace(/\n?```/, "")
      .trim();

    const ideas = JSON.parse(cleanJsonText);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error("Invalid array returned by AI");
    }

    // 3. Save to database
    for (const idea of ideas) {
      await prisma.pinterestIdea.create({
        data: {
          title: idea.title,
          concept: idea.concept,
          status: "PENDING"
        }
      });
    }

    // 4. Send email alert to admin
    const adminEmail = process.env.ADMIN_EMAIL || "prince4sharmaa123@gmail.com";
    const siteUrl = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
    const reviewUrl = `${siteUrl.replace(/\/$/, "")}/admin/pinterest/ideas`;

    const ideasListHtml = ideas.map((idea: any, index: number) => {
      return `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #e60023; border-radius: 4px; background: #fafafa;">
          <h3 style="margin: 0 0 8px 0; color: #111; font-family: serif; font-size: 18px;">${index + 1}. ${idea.title}</h3>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5;">${idea.concept}</p>
        </div>
      `;
    }).join("");

    const htmlContent = `
      <p>Hello Stewart Lucas,</p>
      <p>Gemini has analyzed your content and brainstormed <strong>5 brand-new, unique recipe/blog ideas</strong> for your Pinterest posting pipeline:</p>
      
      <div style="margin: 25px 0;">
        ${ideasListHtml}
      </div>

      <p>Click the button below to approve or reject these ideas on your admin dashboard. Approved ideas will automatically generate full draft posts and visual Pin graphics.</p>
      
      <div class="cta-container">
        <a href="${reviewUrl}" class="cta-button">Review & Approve Ideas</a>
      </div>
      
      <p>To your health and success,</p>
      <p><strong>The NutriGuide Team</strong></p>
    `;

    try {
      await sendPinterestAlertEmail({
        to: adminEmail,
        subject: "New Pinterest Ideas Ready for Review! 📌",
        htmlContent
      });
    } catch (err: any) {
      console.error("❌ Failed to send ideas email notification:", err.message || err);
    }

    return NextResponse.json({ success: true, count: ideas.length });

  } catch (error: any) {
    console.error("Web generate ideas error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
