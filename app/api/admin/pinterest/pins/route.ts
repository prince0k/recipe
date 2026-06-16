import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGeminiResponse } from "@/lib/ai";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draftPins = await prisma.pinterestPin.findMany({
      where: {
        status: "DRAFT"
      },
      include: {
        content: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(draftPins);
  } catch (error: any) {
    console.error("Fetch draft pins error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, pinIds } = await req.json();

    if (action !== "approve_all" && (!pinIds || !Array.isArray(pinIds))) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // 1. Fetch the pins to schedule
    const filter = action === "approve_all" ? { status: "DRAFT" } : { id: { in: pinIds }, status: "DRAFT" };
    
    const pins = await prisma.pinterestPin.findMany({
      where: filter,
      include: {
        content: true
      }
    });

    if (pins.length === 0) {
      return NextResponse.json({ error: "No draft pins found to schedule" }, { status: 400 });
    }

    // 2. Query Gemini for the best 2 posting times
    console.log("⏰ Asking Gemini for the best 2 Pinterest posting times...");
    const prompt = `
We are scheduling Pinterest posts for a wellness/nutrition website (NutriGuide).
Please determine the best 2 distinct future posting times within the next 48 hours for maximum engagement.
Pinterest peak hours are generally evenings, between 7:00 PM and 10:00 PM EST (Eastern Standard Time).

Return strictly a JSON array containing 2 future date-time strings in ISO 8601 format, ordered chronologically.
Do not include markdown tags, markdown blocks (like \`\`\`json), or any other wrapper text.

Format:
[
  "2026-06-17T20:00:00.000Z",
  "2026-06-18T20:30:00.000Z"
]
`;

    let time1: Date;
    let time2: Date;

    try {
      const gResponse = await getGeminiResponse(prompt, true);
      const times = JSON.parse(gResponse.replace(/```json\n?/, "").replace(/\n?```/, "").trim());
      
      time1 = new Date(times[0]);
      time2 = new Date(times[1]);

      // Simple validation: make sure they are valid dates and in the future
      if (isNaN(time1.getTime()) || isNaN(time2.getTime())) {
        throw new Error("Invalid dates returned by AI");
      }
    } catch (err: any) {
      console.warn("⚠️ AI Time generation failed or returned malformed date. Using fallback times:", err.message);
      
      // Fallback: Tomorrow 8:00 PM EST (translated roughly to UTC) and Day After 8:30 PM EST
      const now = new Date();
      
      time1 = new Date(now);
      time1.setDate(now.getDate() + 1);
      time1.setUTCHours(20, 0, 0, 0); // 8:00 PM UTC/EST placeholder
      
      time2 = new Date(now);
      time2.setDate(now.getDate() + 2);
      time2.setUTCHours(20, 30, 0, 0); // 8:30 PM UTC/EST placeholder
    }

    console.log(`⏰ Scheduled times determined: \n  - Time 1: ${time1.toISOString()}\n  - Time 2: ${time2.toISOString()}`);

    // 3. Separate Pins into New and Old
    const newPins = pins.filter(p => p.isNew);
    const oldPins = pins.filter(p => !p.isNew);

    // We pair them: 
    // Time 1 gets the first new pin and the first old pin
    // Time 2 gets the second new pin and the second old pin
    // If there are leftovers, we distribute them evenly between Time 1 and Time 2

    const scheduledUpdates: Array<{ pinId: string; date: Date }> = [];

    // Distribute New Pins
    newPins.forEach((pin, index) => {
      const scheduledDate = index % 2 === 0 ? time1 : time2;
      scheduledUpdates.push({ pinId: pin.id, date: scheduledDate });
    });

    // Distribute Old Pins
    oldPins.forEach((pin, index) => {
      const scheduledDate = index % 2 === 0 ? time1 : time2;
      scheduledUpdates.push({ pinId: pin.id, date: scheduledDate });
    });

    // 4. Perform database updates
    for (const update of scheduledUpdates) {
      const pinObj = pins.find(p => p.id === update.pinId);
      
      await prisma.pinterestPin.update({
        where: { id: update.pinId },
        data: {
          status: "SCHEDULED",
          scheduledAt: update.date
        }
      });

      // If it's a new pin, publish the draft content!
      if (pinObj?.isNew && pinObj.contentId) {
        await prisma.content.update({
          where: { id: pinObj.contentId },
          data: {
            published: true // Content is now published on the site
          }
        });
        console.log(`🟢 Published draft content: "${pinObj.content?.title}"`);
      }
    }

    return NextResponse.json({
      success: true,
      scheduledCount: scheduledUpdates.length,
      time1: time1.toISOString(),
      time2: time2.toISOString()
    });

  } catch (error: any) {
    console.error("Schedule pins error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
