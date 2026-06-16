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
        
        // Define formatter for America/New_York
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hourCycle: "h23",
        });

        // Helper to get local NY representation as a UTC Date
        const getNYLocalRepresentationAsUTC = (d: Date): Date => {
          const parts = formatter.formatToParts(d);
          const partValue = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
          return new Date(Date.UTC(
            partValue("year"),
            partValue("month") - 1,
            partValue("day"),
            partValue("hour"),
            partValue("minute"),
            0,
            0
          ));
        };

        // Helper to convert NY local fields back to true UTC
        const nyToUTC = (year: number, month: number, day: number, hour: number, minute: number): Date => {
          const approxUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
          const approxNY = getNYLocalRepresentationAsUTC(approxUTC);
          const offsetMs = approxNY.getTime() - approxUTC.getTime();
          return new Date(approxUTC.getTime() - offsetMs);
        };

        const nowNYAsUTC = getNYLocalRepresentationAsUTC(now);

        const today6AM = new Date(nowNYAsUTC);
        today6AM.setUTCHours(6, 0, 0, 0);

        const today6PM = new Date(nowNYAsUTC);
        today6PM.setUTCHours(18, 0, 0, 0);

        const slots: Date[] = [];

        // If today 6:00 AM NY is in the future
        if (today6AM.getTime() > nowNYAsUTC.getTime()) {
          slots.push(today6AM);
        }

        // If today 6:00 PM NY is in the future
        if (today6PM.getTime() > nowNYAsUTC.getTime()) {
          slots.push(today6PM);
        }

        // Tomorrow slots
        const tomorrow6AM = new Date(today6AM);
        tomorrow6AM.setUTCDate(tomorrow6AM.getUTCDate() + 1);
        slots.push(tomorrow6AM);

        const tomorrow6PM = new Date(today6PM);
        tomorrow6PM.setUTCDate(tomorrow6PM.getUTCDate() + 1);
        slots.push(tomorrow6PM);

        // Sort ascending
        slots.sort((a, b) => a.getTime() - b.getTime());

        // Get the first 2 slots
        const [slot1, slot2] = slots.slice(0, 2);

        // Convert the NY representations to actual UTC Date objects
        const actualUTC1 = nyToUTC(
          slot1.getUTCFullYear(),
          slot1.getUTCMonth() + 1,
          slot1.getUTCDate(),
          slot1.getUTCHours(),
          slot1.getUTCMinutes()
        );

        const actualUTC2 = nyToUTC(
          slot2.getUTCFullYear(),
          slot2.getUTCMonth() + 1,
          slot2.getUTCDate(),
          slot2.getUTCHours(),
          slot2.getUTCMinutes()
        );

        return [actualUTC1, actualUTC2];
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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pinIds } = await req.json();

    if (!pinIds || !Array.isArray(pinIds)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const pins = await prisma.pinterestPin.findMany({
      where: {
        id: { in: pinIds }
      }
    });

    for (const pin of pins) {
      // Delete the PinterestPin draft
      await prisma.pinterestPin.delete({
        where: { id: pin.id }
      });

      // If it's a new pin, delete its associated draft content
      if (pin.isNew && pin.contentId) {
        await prisma.content.delete({
          where: { id: pin.contentId }
        });
        console.log(`🧹 Deleted content draft: ${pin.contentId}`);
      }
    }

    return NextResponse.json({ success: true, message: `Successfully deleted ${pins.length} pin draft(s)` });
  } catch (error: any) {
    console.error("Delete pin drafts error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
