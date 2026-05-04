import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1',
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

    // Build the LLM prompt
    let prompt = `Act as an expert nutritionist and health coach.\n`;
    prompt += `Create a highly personalized, actionable version of our "${content.title}" for a client with the following profile:\n\n`;
    prompt += `**Lead Profile:**\n`;
    prompt += `- Age Range: ${leadData.age}\n`;
    prompt += `- Primary Goal: ${leadData.goal}\n`;
    prompt += `- Dietary Restrictions: ${leadData.diet}\n`;
    prompt += `- Daily Prep Time: ${leadData.time}\n\n`;

    prompt += `**Specific Pain Points:**\n`;
    // Add custom question answers
    Object.keys(answers).forEach((key) => {
      if (key.startsWith("custom_")) {
        try {
          const index = parseInt(key.split("_")[1]);
          const customQuestions = JSON.parse(content.painPointQuestions || "[]");
          if (customQuestions[index]) {
            prompt += `- Q: ${customQuestions[index].question}\n  A: ${answers[key]}\n`;
          }
        } catch (e) {}
      }
    });

    prompt += `\n**Instructions for Generation:**\n`;
    prompt += `1. Acknowledge their specific pain points and explain briefly how this plan addresses them.\n`;
    prompt += `2. Provide a structured plan (e.g., 7-day meal plan or cheat sheet rules) that strictly adheres to their dietary restrictions (${leadData.diet}) and time constraints (${leadData.time}).\n`;
    prompt += `3. Use a supportive, encouraging, and expert tone.\n`;
    prompt += `4. Format the output in clean Markdown.\n`;

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
          model: 'gemini-1.5-flash',
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
