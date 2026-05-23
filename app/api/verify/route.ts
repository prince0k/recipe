import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(new URL("/login?error=missing_verification_params", req.url));
    }

    // 1. Find the token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
      },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    // 2. Check expiration
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(new URL("/login?error=token_expired", req.url));
    }

    // 3. Verify the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // ─── Fire welcome email (async) ──────────────────────────────────
    const { sendWelcomeEmail } = await import("@/lib/email");
    sendWelcomeEmail(email, updatedUser.name || "").catch((err) =>
      console.error("[verify] Welcome email fire-and-forget error:", err)
    );

    // 4. Delete the token (used)
    await prisma.verificationToken.delete({
      where: { token },
    });

    // 5. Redirect to home with success message
    return NextResponse.redirect(new URL("/?verified=true", req.url));

  } catch (error) {
    console.error("[verify] Verification error:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", req.url));
  }
}
