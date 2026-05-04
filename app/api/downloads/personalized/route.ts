import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, answers } = await req.json();

    if (!contentId || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the content to know its title and pain point questions
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Extract lead data (the first 4 standard questions)
    const leadData = {
      goal: answers["goal"] || "",
      age: answers["age"] || "",
      diet: answers["diet"] || "",
      time: answers["time"] || "",
    };

    const userName = session.user.name || "Friend";

    // Build the LLM prompt with Stwart Lucas brand voice
    let prompt = `Act as **Stwart Lucas**, the expert culinary coach and nutritionist behind this platform. Your tone is warm, cinematic, encouraging, and deeply professional. You are writing to ${userName}.\n\n`;
    prompt += `Create a **Premium Personalized Edition** of our "${content.title}" for ${userName}. They have shared the following profile with us:\n\n`;
    prompt += `**Client Profile:**\n`;
    prompt += `- **Name**: ${userName}\n`;
    prompt += `- **Age Range**: ${leadData.age}\n`;
    prompt += `- **Main Goal**: ${leadData.goal}\n`;
    prompt += `- **Dietary Preference**: ${leadData.diet}\n`;
    prompt += `- **Daily Prep Capacity**: ${leadData.time}\n\n`;

    prompt += `**Personalized Insights:**\n`;
    // Add custom question answers
    Object.keys(answers).forEach((key) => {
      if (key.startsWith("custom_")) {
        try {
          const index = parseInt(key.split("_")[1]);
          const customQuestions = JSON.parse(content.painPointQuestions || "[]");
          if (customQuestions[index]) {
            prompt += `- **${customQuestions[index].question}**: ${answers[key]}\n`;
          }
        } catch (e) {}
      }
    });

    prompt += `\n**Instructions for Stwart Lucas Voice:**\n`;
    prompt += `1. **Personalization**: Address ${userName} directly. Use their name naturally in the introduction and conclusion.\n`;
    prompt += `2. **Cinematic Aesthetic**: Use words like "vibrant," "cinematic," "artisanal," "honest cooking," and "nourished." Avoid bulky paragraphs. Use short, punchy, elegant sentences.\n`;
    prompt += `3. **Visual Spacing**: **CRITICAL**: Use double newlines between every section and every meal. Ensure the content is not a wall of text. Use a lot of white space.\n`;
    prompt += `4. **Structure**: Use clean Markdown. Use "###" for section headers. Use bold text for emphasis. Present the 7-day plan in a clear, easy-to-read format (e.g., using a table or highly structured lists with bullet points).\n`;
    prompt += `5. **Strict Adherence**: Ensure every suggestion fits the ${leadData.diet} diet and respects the ${leadData.time} prep time.\n`;
    prompt += `6. **Visual Focus**: Describe the food in a way that feels visual and appetizing.\n`;
    prompt += `7. **Tone**: Be an expert guide who simplifies the complex. Make them feel empowered, not overwhelmed.\n`;

    // 1. Update User Lead Data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        leadData: JSON.stringify(leadData)
      }
    });

    // Strip HTML from the original body to save tokens
    const strippedBody = content.body.replace(/<[^>]*>?/gm, '');

    // 2. Call Gemini to generate the personalized plan with retries
    let generatedContent = "Generation pending. (Error: AI service currently unavailable.)";
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${prompt}\n\nHere is the general plan to personalize:\n\n${strippedBody}`,
        });
        generatedContent = response.text || generatedContent;
        break; // Success!
      } catch (aiError: any) {
        attempts++;
        console.error(`Gemini Attempt ${attempts} Failed:`, aiError.message);
        generatedContent = `[AI Generation Failed] ${aiError.message}`;
        
        if (attempts < maxAttempts) {
          // Wait 5 seconds before retrying (increased for rate limits)
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // 3. Create the Personalized Request with the output
    const request = await prisma.personalizedRequest.create({
      data: {
        userId: session.user.id,
        contentId: content.id,
        answers: JSON.stringify(answers),
        generatedPrompt: prompt,
        generatedContent: generatedContent,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, requestId: request.id }, { status: 201 });

  } catch (error) {
    console.error("Personalized download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
