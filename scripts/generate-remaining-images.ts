import { PrismaClient } from "@prisma/client";
import { saveAndCompressImage } from "../lib/image-utils";

const prisma = new PrismaClient();
const falKey = process.env.FAL_KEY || "587f2f27-3da0-47fd-987e-053572ce7f8f:c41589d005b2f62dbde3b45c468f9cb5";

async function main() {
  console.log("Fetching content items to process...");
  const contents = await prisma.content.findMany();
  
  const itemsToGenerate = contents.filter(item => item.coverImage && item.coverImage.includes("pollinations.ai"));
  console.log(`Found ${itemsToGenerate.length} items to generate.`);

  for (const item of itemsToGenerate) {
    const img = item.coverImage!;
    console.log(`Processing item: "${item.title}"`);
    
    // Extract prompt from pollinations URL
    const urlParts = img.split("/prompt/");
    if (urlParts.length < 2) {
      console.log(`⚠️ Could not extract prompt from URL: ${img}`);
      continue;
    }
    const promptQuery = urlParts[1].split("?")[0];
    const prompt = decodeURIComponent(promptQuery);
    
    console.log(`Extracted Prompt: "${prompt}"`);
    
    try {
      console.log(`Generating cover image for "${item.title}" using flux/schnell...`);
      const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          num_images: 1,
          aspect_ratio: "16:9",
          output_format: "png",
          resolution: "1K"
        })
      });

      if (!response.ok) {
        throw new Error(`Fal.ai error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      const remoteUrl = data.images?.[0]?.url;
      if (!remoteUrl) {
        throw new Error("No image URL returned by AI");
      }

      console.log(`Localizing and compressing generated image...`);
      const localUrl = await saveAndCompressImage(remoteUrl, item.title);
      
      await prisma.content.update({
        where: { id: item.id },
        data: { coverImage: localUrl }
      });
      
      console.log(`✅ Successfully updated: ${localUrl}\n`);
    } catch (err: any) {
      console.error(`❌ Failed for "${item.title}":`, err.message);
    }
  }
  
  console.log("Image generation run complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
