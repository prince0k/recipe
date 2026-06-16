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
We want to expand our website and Pinterest pipeline with 5 brand-new, unique, science-backed recipe or healthy diet/lifestyle blog post ideas.

Here is a list of our existing content titles:
${existingTitles.map(t => `- ${t}`).join("\n")}

CRITICAL BRAINSTORMING CONDITIONS:
1. ABSOLUTE UNIQUENESS: The new titles and concepts must be completely unique and have ZERO semantic or keyword duplication/overlap with any of the 1,300+ existing titles. Do not just rephrase or swap adjectives (e.g., if "Anti-Inflammatory Ginger Tea" exists, do not suggest "Anti-Inflammatory Turmeric Ginger Tea").
2. CORE HEALTH TOPICS: Every idea must have a strong health and wellness angle (e.g., healing gut health, balancing hormones, managing insulin resistance/blood sugar, reducing chronic inflammation, clean whole-food nutrition, or daily wellness routines).
3. STEWART LUCAS BRAND VOICE: Written in the voice of Stewart Lucas—approachable, highly credible, expert, conversational, warm, kitchen-practical, and science-backed.
4. STRICT CATEGORIZATION: The "type" field MUST be exactly one of: "RECIPE", "BLOG", "DIET_PLAN", or "CHEAT_SHEET".
5. PINTEREST & SEO OPTIMIZED TITLE: The title must be catchy, click-worthy, keyword-rich, and strictly under 75 characters.

Return your response strictly as a JSON array of objects. Do not include markdown formatting (like \`\`\`json), just return the raw JSON string.

Each object in the array must have:
- "title": A catchy, click-worthy, keyword-rich title for Pinterest and search engines (max 75 characters).
- "concept": A brief 2-3 sentence summary explaining the concept, the core health benefit, and what makes it exciting.
- "type": The content category. Must be strictly one of these values: "RECIPE", "BLOG", "DIET_PLAN", or "CHEAT_SHEET".

Format example:
[
  {
    "title": "Vibrant Citrus Avocado Summer Salad",
    "concept": "A refreshing low-carb salad combining healthy fats from avocado with zesty antioxidants from seasonal citrus. Perfect for thyroid support and morning freshness.",
    "type": "RECIPE"
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
          type: idea.type || "RECIPE",
          status: "PENDING"
        }
      });
    }

    // 4. Send email alert to admin
    const adminEmail = process.env.ADMIN_EMAIL || "prince4sharmaa123@gmail.com";
    const siteUrl = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
    const reviewUrl = `${siteUrl.replace(/\/$/, "")}/admin/pinterest/ideas`;

    const ideasListHtml = ideas.map((idea: any) => {
      const typeLabel = idea.type ? idea.type.toUpperCase().replace("_", " ") : "RECIPE";
      
      let badgeBg = "#f3f4f6";
      let badgeText = "#4b5563";
      
      if (typeLabel === "RECIPE") {
        badgeBg = "#ecfdf5";
        badgeText = "#059669";
      } else if (typeLabel === "BLOG") {
        badgeBg = "#eff6ff";
        badgeText = "#2563eb";
      } else if (typeLabel === "DIET PLAN") {
        badgeBg = "#fff7ed";
        badgeText = "#c2410c";
      } else if (typeLabel === "CHEAT SHEET") {
        badgeBg = "#f5f3ff";
        badgeText = "#7c3aed";
      }

      return `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #e60023; border-radius: 4px; background: #fafafa;">
          <div style="margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: bold; background: ${badgeBg}; color: ${badgeText}; padding: 3px 8px; border-radius: 999px; margin-right: 8px; vertical-align: middle; border: 1px solid ${badgeText}15;">${typeLabel}</span>
            <h3 style="margin: 0; color: #111; font-family: serif; font-size: 18px; display: inline-block; vertical-align: middle;">${idea.title}</h3>
          </div>
          <div style="margin: 0 0 10px 5px; font-size: 13px; color: #666;">
            <strong>Content Type:</strong> <span style="color: ${badgeText}; font-weight: bold;">${typeLabel}</span>
          </div>
          <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5; padding-left: 5px;">${idea.concept}</p>
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
