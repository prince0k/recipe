import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function listModels() {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log("Available Models:");
    models.models.forEach(m => console.log(`- ${m.name}`));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
