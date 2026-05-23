import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password, consent } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Make the first user an admin, or check if email matches ADMIN_EMAIL
    const count = await prisma.user.count();
    const isAdmin = count === 0 || email === process.env.ADMIN_EMAIL;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        marketingConsent: !!consent,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    // ─── Fire verification email (async, non-blocking) ────────────────
    console.log(`[register] Triggering verification email for ${email}`);
    sendVerificationEmail(email, name || "").catch((err) =>
      console.error("[register] Verification email fire-and-forget error:", err)
    );

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
