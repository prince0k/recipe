import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const imageAi = new GoogleGenAI({
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
 * Generates cinematic images using Google Imagen 4.0 Ultra
 * (Completely removes OpenAI dependency)
 */
export async function generateImage(prompt: string) {
  try {
    console.log(`Generating Imagen image for: ${prompt}`);

    // Uses imageAi client (no v1beta) — Imagen requires the default API version
    const response = await imageAi.models.generateImages({
      model: "gemini-3.1-flash-image-preview",
      prompt: `Premium culinary photography, cinematic lighting, artisanal style, 8k resolution, professional food styling: ${prompt}`,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
      }
    });

    if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }

    throw new Error("Imagen returned no images");
  } catch (error: any) {
    console.error("Imagen Error:", error.message || error);

    // Reliable Unsplash fallback — source.unsplash.com is dead, this URL works
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80`;
  }
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
