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

    // Check rate limit: One request per 24 hours
    const lastRequest = await prisma.personalizedRequest.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (lastRequest) {
      return NextResponse.json({ 
        error: "You can only request one personalized plan per day. Please try again later." 
      }, { status: 429 });
    }

    // Get the content to know its title and pain point questions
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Extract lead data
    const leadData = {
      goal: answers["goal"] || "",
      age: answers["age"] || "",
      gender: answers["gender"] || "",
      diet: answers["diet"] || "",
      time: answers["time"] || "",
      activity: answers["activity"] || "",
      struggle: answers["struggle"] || "",
      additional: answers["additional"] || "",
    };

    const userName = session.user.name || "Friend";

    // Build the LLM prompt with Stewart Lucas brand voice
    let prompt = `Act as Stewart Lucas, representing NutriGuide. You are the expert culinary coach and nutritionist. Your tone is warm, cinematic, encouraging, and deeply professional. You are writing a **one-of-a-kind** Premium Personalized Edition for ${userName}.\n\n`;
    
    prompt += `**CRITICAL MISSION:** Do NOT give general advice. ${userName} is struggling with **"${leadData.struggle}"**. You MUST address this struggle directly and offer specific, actionable solutions woven into their plan. They also mentioned: "${leadData.additional || "No additional details provided."}".\n\n`;

    prompt += `**Client Profile for Deep Personalization:**\n`;
    prompt += `- **Name**: ${userName}\n`;
    prompt += `- **Primary Struggle (Addressing this is MANDATORY)**: ${leadData.struggle}\n`;
    prompt += `- **Additional Context**: ${leadData.additional || "None"}\n`;
    prompt += `- **Age Range**: ${leadData.age}\n`;
    prompt += `- **Main Goal**: ${leadData.goal}\n`;
    prompt += `- **Dietary Preference**: ${leadData.diet}\n`;
    prompt += `- **Activity Level**: ${leadData.activity}\n`;
    prompt += `- **Prep Capacity**: ${leadData.time}\n\n`;

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

    prompt += `\n**Instructions for Stewart Lucas Voice & Content:**\n`;
    prompt += `1. **Acknowledge the Pain**: In your introduction, acknowledge that ${userName} is struggling with ${leadData.struggle}. Make them feel seen and understood. Explain how this personalized plan is specifically designed to overcome that barrier.\n`;
    prompt += `2. **Specific Solutions**: If they struggle with cravings, suggest satiating high-protein snacks. If they struggle with time, suggest "one-pot" cinematic meals. Match the logic to their specific profile.\n`;
    prompt += `3. **Cinematic Aesthetic**: Use words like "vibrant," "artisanal," "honest cooking," and "nourished." Use short, punchy, elegant sentences. Avoid bulky blocks of text.\n`;
    prompt += `4. **Structure**: Use clean Markdown. Use "###" for section headers. Present a structured plan with clear, appetizing descriptions.\n`;
    prompt += `5. **No Generics**: Avoid phrases like "eat a balanced diet." Instead, say "Anchor your morning with vibrant, plant-based proteins to quiet the mid-day noise of cravings."\n`;
    prompt += `6. **Visual Descriptions**: Describe the colors, textures, and aromas of the food to make it feel premium.\n`;

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
