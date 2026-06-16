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

    // 2. Calculate the next available 6:00 AM and 6:00 PM US Eastern Time (New York) slots
    let time1: Date;
    let time2: Date;

    try {
      const getNextUSTimeSlots = (): [Date, Date] => {
        const now = new Date();
        // Get the current New York time string representation
        const nyString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
        const nyDate = new Date(nyString);
        
        // Define target times on New York timeline
        const sixAM = new Date(nyDate);
        sixAM.setHours(6, 0, 0, 0);
        
        const sixPM = new Date(nyDate);
        sixPM.setHours(18, 0, 0, 0);
        
        const slots: Date[] = [];
        
        // If 6:00 AM today is in the future
        if (nyDate.getTime() < sixAM.getTime()) {
          slots.push(sixAM);
        }
        
        // If 6:00 PM today is in the future
        if (nyDate.getTime() < sixPM.getTime()) {
          slots.push(sixPM);
        }
        
        // Tomorrow slots
        const tomorrowAM = new Date(sixAM);
        tomorrowAM.setDate(tomorrowAM.getDate() + 1);
        slots.push(tomorrowAM);
        
        const tomorrowPM = new Date(sixPM);
        tomorrowPM.setDate(tomorrowPM.getDate() + 1);
        slots.push(tomorrowPM);
        
        // Pick the first 2 future slots
        const futureSlots = slots
          .filter(slot => slot.getTime() > nyDate.getTime())
          .slice(0, 2);
          
        // Convert New York local representation back to system UTC time
        const localNYTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        const offsetMs = localNYTime.getTime() - now.getTime();
        
        return futureSlots.map(slot => new Date(slot.getTime() - offsetMs)) as [Date, Date];
      };

      const [slot1, slot2] = getNextUSTimeSlots();
      time1 = slot1;
      time2 = slot2;
    } catch (err: any) {
      console.warn("⚠️ Direct Time calculation failed. Using fallback times:", err.message);
      
      const now = new Date();
      time1 = new Date(now);
      time1.setDate(now.getDate() + 1);
      time1.setUTCHours(10, 0, 0, 0); // 6:00 AM EDT (10:00 AM UTC) fallback
      
      time2 = new Date(now);
      time2.setDate(now.getDate() + 1);
      time2.setUTCHours(22, 0, 0, 0); // 6:00 PM EDT (10:00 PM UTC) fallback
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
