import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Reliable text models list
const MODELS = [
  'gemini-3.1-flash-lite-preview'
];

export async function getGeminiResponse(prompt: string, jsonMode = false) {
  let lastError: any = null;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const modelName of MODELS) {
    let attempts = 0;
    const maxAttempts = 3; // Try each model up to 3 times

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
        return text;
      } catch (error: any) {
        attempts++;
        lastError = error;
        const msg = (error.message || "").toLowerCase();

        console.warn(`[AI Attempt ${attempts}/${maxAttempts}] ${modelName} failed: ${msg.substring(0, 100)}...`);

        // If the model literally doesn't exist on this API key, don't waste time retrying it
        if (msg.includes("404") || msg.includes("not found")) break;

        // Smart Rate Limit Handling
        if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
          if (attempts < maxAttempts) {
            // Look for "retry in 16.27s" in Google's error
            const retryMatch = msg.match(/retry in (\d+(?:\.\d+)?)s/);
            let waitMs = 10000; // Default 10s

            if (retryMatch && retryMatch[1]) {
              waitMs = (Math.ceil(parseFloat(retryMatch[1])) + 1) * 1000; // requested wait + 1 buffer second
            }

            console.log(`Rate limit hit. Google requested cool down. Waiting ${waitMs / 1000} seconds before retrying...`);
            await delay(waitMs);
            continue;
          }
          break; // Move to next model if we exhausted our 3 attempts
        }

        // Server overload errors
        if (msg.includes("503") || msg.includes("high demand") || msg.includes("unavailable")) {
          if (attempts < maxAttempts) {
            await delay(5000);
            continue;
          }
          break;
        }

        // Unhandled error
        break;
      }
    }
  }
  throw lastError || new Error("All AI models failed due to rate limits or API errors.");
}

/**
 * Generates unique, content-specific images using Gemini native image generation.
 * 
 * 3-Tier Cascade:
 *   1. gemini-3-pro-image-preview    — Best quality, highest fidelity
 *   2. gemini-3.1-flash-image-preview — Fast fallback
 *   3. pollinations.ai               — Last resort (free, no API key needed)
 */
const IMAGE_MODELS = [
  "gemini-3-pro-image-preview",
  "gemini-3.1-flash-image-preview",
];

export async function generateImage(prompt: string): Promise<string> {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- Tier 1 & 2: Gemini Native Image Generation ---
  for (const model of IMAGE_MODELS) {
    try {
      console.log(`[Image Gen] Trying ${model} for: "${prompt.substring(0, 80)}..."`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ["image", "text"],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);

      if (imagePart?.inlineData?.data) {
        const mimeType = imagePart.inlineData.mimeType || "image/jpeg";
        console.log(`[Image Gen] ✅ ${model} succeeded (${(imagePart.inlineData.data.length / 1024).toFixed(0)}KB)`);
        return `data:${mimeType};base64,${imagePart.inlineData.data}`;
      }

      console.warn(`[Image Gen] ${model} returned no image data, trying next model...`);
    } catch (error: any) {
      const msg = (error.message || "").toLowerCase();
      console.warn(`[Image Gen] ${model} failed: ${msg.substring(0, 150)}`);

      // If rate limited, wait and try same model once more
      if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
        const retryMatch = msg.match(/retry in (\d+(?:\.\d+)?)s/);
        const waitMs = retryMatch?.[1] ? (Math.ceil(parseFloat(retryMatch[1])) + 1) * 1000 : 10000;
        console.log(`[Image Gen] Rate limited on ${model}. Waiting ${waitMs / 1000}s...`);
        await delay(waitMs);

        // One retry after waiting
        try {
          const retryResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseModalities: ["image", "text"] },
          });
          const retryParts = retryResponse.candidates?.[0]?.content?.parts || [];
          const retryImage = retryParts.find((p: any) => p.inlineData);
          if (retryImage?.inlineData?.data) {
            const mimeType = retryImage.inlineData.mimeType || "image/jpeg";
            console.log(`[Image Gen] ✅ ${model} succeeded on retry`);
            return `data:${mimeType};base64,${retryImage.inlineData.data}`;
          }
        } catch {
          // Continue to next model
        }
      }

      // 404 = model doesn't exist, skip immediately
      if (msg.includes("404") || msg.includes("not found")) continue;
    }
  }

  // --- Tier 3: Pollinations.ai (Last Resort) ---
  console.warn(`[Image Gen] ⚠️ All Gemini models failed. Falling back to Pollinations.ai`);
  const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ,.\-']/g, "").slice(0, 300);
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=800&seed=${seed}&nologo=true`;
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
