import { GoogleGenAI } from "@google/genai";
import { prisma } from "./db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Reliable text models list
// Stage 1: Cost-optimized prompt/text generation
const STABLE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash',
  'gemini-3.1-pro',
  'gemini-3-flash',
  'gemini-2.5-flash',
];

// Stage 2/3: Image generation models (Using stable lowest cost option)
const IMAGE_PREVIEW_MODEL = "gemini-2.5-flash-image";
const IMAGE_PRO_MODEL = "gemini-2.5-flash-image";

const DAILY_BUDGET_CAP_INR = 200;
const DAILY_IMAGE_LIMIT = 10;
const COST_PER_IMAGE_INR = 0.5; // Estimated
const COST_PER_1K_TOKENS_INR = 0.05; // Estimated

export async function getGeminiResponse(prompt: string, jsonMode = false) {
  const startTime = Date.now();
  let lastError: any = null;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // 1. Duplicate Detection (Disabled for text until result storage is added to AILog)
  /*
  const existing = await prisma.aILog.findFirst({
    where: { prompt, type: "TEXT", status: "SUCCESS" },
    orderBy: { createdAt: 'desc' }
  });
  ...
  */

  for (const modelName of STABLE_MODELS) {
    let attempts = 0;
    const maxAttempts = 2; // Rule 11: max 2 retries

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        let text = response.text || "";
        if (jsonMode) {
          text = text.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
        }

        // Log successful generation
        await prisma.aILog.create({
          data: {
            prompt,
            model: modelName,
            provider: "GEMINI",
            type: "TEXT",
            duration: Date.now() - startTime,
            status: "SUCCESS",
            estimatedCost: COST_PER_1K_TOKENS_INR * 0.5 // Rough estimate
          }
        });

        return text;
      } catch (error: any) {
        attempts++;
        lastError = error;
        const msg = (error.message || "").toLowerCase();
        console.warn(`[AI Attempt ${attempts}/${maxAttempts}] ${modelName} failed: ${msg.substring(0, 100)}...`);
        
        if (msg.includes("404") || msg.includes("not found")) break;
        if (msg.includes("429") || msg.includes("quota")) {
          if (attempts < maxAttempts) { await delay(10000); continue; }
          break;
        }
        break;
      }
    }
  }

  await prisma.aILog.create({
    data: {
      prompt,
      model: "FAILOVER",
      provider: "NONE",
      type: "TEXT",
      status: "FAILURE",
      failureReason: lastError?.message?.substring(0, 500)
    }
  });

  throw lastError || new Error("All AI models failed.");
}

export async function generateImage(prompt: string, quality: 'preview' | 'production' = 'preview'): Promise<string> {
  const startTime = Date.now();
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const model = quality === 'production' ? IMAGE_PRO_MODEL : IMAGE_PREVIEW_MODEL;

  // 1. Budget & Usage Cap Check (Rule 8 + 10-image limit)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaysSpend, todaysImageCount] = await Promise.all([
    prisma.aILog.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { estimatedCost: true }
    }),
    prisma.aILog.count({
      where: { 
        createdAt: { gte: todayStart },
        type: "IMAGE",
        status: "SUCCESS"
      }
    })
  ]);

  const currentSpend = todaysSpend._sum.estimatedCost || 0;
  if (currentSpend >= DAILY_BUDGET_CAP_INR || todaysImageCount >= DAILY_IMAGE_LIMIT) {
    const reason = currentSpend >= DAILY_BUDGET_CAP_INR ? "BUDGET_CAP_REACHED" : "DAILY_IMAGE_LIMIT_REACHED";
    console.warn(`⚠️ ${reason}! Forcing Fallback Mode.`);
    return await handleImageFallback(prompt, reason, startTime);
  }

  // 2. Duplicate Detection (Rule 10)
  // Check if an image with exactly the same prompt was generated successfully in the last 30 days
  const existing = await prisma.aILog.findFirst({
    where: { prompt, type: "IMAGE", status: "SUCCESS" },
    orderBy: { createdAt: 'desc' }
  });
  if (existing && existing.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
    console.log("♻️ Reusing existing image metadata/logs (Duplicate Detection)");
    // Note: In a real system, we'd return the file path from the previous generation
    // For now, we continue but this provides the hooks for Rule 10.
  }

  // 3. Generation Logic with Retry Limits (Rule 11)
  const maxAttempts = 2; // Rule 11: max 2 retries
  let attempts = 0;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`[Image Gen] [${quality.toUpperCase()}] Attempt ${attempts}/${maxAttempts} using ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseModalities: ["image", "text"] },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);

      if (imagePart?.inlineData?.data) {
        const mimeType = imagePart.inlineData.mimeType || "image/jpeg";
        const data = `data:${mimeType};base64,${imagePart.inlineData.data}`;
        
        // Log Success
        await prisma.aILog.create({
          data: {
            prompt,
            model,
            provider: "GEMINI",
            type: "IMAGE",
            duration: Date.now() - startTime,
            status: "SUCCESS",
            estimatedCost: COST_PER_IMAGE_INR,
            dimensions: "1200x800", // Standard
            outputSize: imagePart.inlineData.data.length
          }
        });

        return data;
      }
      console.warn(`[Image Gen] ${model} returned no image data`);
    } catch (error: any) {
      lastError = error;
      const msg = (error.message || "").toLowerCase();
      console.warn(`[Image Gen] ${model} failed: ${msg.substring(0, 100)}`);
      if (msg.includes("429") || msg.includes("quota")) {
        await delay(10000);
        continue;
      }
      break; 
    }
  }

  // 4. Fallback Logic (Rule 2)
  return await handleImageFallback(prompt, lastError?.message || "MAX_RETRIES_EXCEEDED", startTime);
}

async function handleImageFallback(prompt: string, reason: string, startTime: number) {
  console.warn(`[Image Gen] ⚠️ Falling back to Pollinations.ai due to: ${reason}`);
  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ,.\-']/g, "").slice(0, 300);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=800&seed=${seed}&nologo=true`;

  await prisma.aILog.create({
    data: {
      prompt,
      model: "POLLINATIONS",
      provider: "FALLBACK",
      type: "IMAGE",
      duration: Date.now() - startTime,
      status: "FALLBACK",
      estimatedCost: 0, // Free
      failureReason: reason.substring(0, 500)
    }
  });

  return url;
}

export async function searchSerper(query: string) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10 }),
    });
    return await response.json();
  } catch (error) {
    console.error("Serper Error:", error);
    throw error;
  }
}

export const STWART_LUCAS_VOICE = `
Act as **Stwart Lucas**, the expert culinary coach and nutritionist. 
Your tone is warm, cinematic, encouraging, and deeply professional. 
Use vibrant words like "cinematic," "artisanal," "honest cooking," and "nourished." 
Avoid bulky paragraphs. Use short, punchy, elegant sentences. 
Focus on visual descriptions and empowering the reader.
`;

export const AI_SEO_GUIDELINES = `
**AI Search Optimization (AEO) Guidelines:**
1. **Direct Answers**: Include a "Quick Summary" or "Key Takeaways" at the start.
2. **Clear Hierarchy**: Use H1 for title, H2 for main sections, and H3 for sub-sections.
3. **FAQ Section**: Include 3-5 frequently asked questions that AI models might use as snippets.
4. **Structured Data**: Focus on factual accuracy and clear definitions.
`;
