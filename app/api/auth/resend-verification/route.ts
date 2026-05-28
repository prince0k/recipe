import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const name = session.user.name || "";

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate and send a new verification email
    console.log(`[resend-verification] Sending verification email to ${email}`);
    const emailResult = await sendVerificationEmail(email, name);

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification email sent successfully" });
  } catch (error) {
    console.error("[resend-verification] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
