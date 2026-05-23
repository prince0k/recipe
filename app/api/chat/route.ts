import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { STEWART_LUCAS_VOICE } from "@/lib/ai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
      ${STEWART_LUCAS_VOICE}
      You are the official AI assistant for "NutriGuide by Stewart Lucas".
      Your goal is to help users with:
      1. Cooking advice and kitchen tips.
      2. Finding recipes on the site (recommend dishes like pasta, healthy salads, or budget meals).
      3. Explaining dietary plans and nutritional advice.
      4. General encouraging conversation about food and cinema.

      Keep your answers concise, helpful, and full of Stewart's signature warmth and cinematic flair.
      If a user asks about something totally unrelated to food or the site, politely guide them back to culinary topics.
    `;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I am Stewart Lucas, your culinary coach from NutriGuide. How can I inspire your cooking today?" }] },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash",
      contents: contents,
    });

    const text = response.text || "";

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to connect to Stewart." }, { status: 500 });
  }
}
