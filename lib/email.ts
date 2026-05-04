import { Resend } from "resend";
import { prisma } from "./db";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
const fromEmail = process.env.EMAIL_FROM || "hello@nutriguide.com";

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `NutriGuide <${fromEmail}>`,
      to,
      subject: "Welcome to NutriGuide! Here are your free resources.",
      html: `
        <h1>Welcome to NutriGuide, ${name || "friend"}!</h1>
        <p>We're thrilled to have you here. You now have unlimited access to our diet plans, healthy recipes, and cheat sheets.</p>
        <p><a href="${process.env.AUTH_URL}">Log in here</a> to explore.</p>
        <br/>
        <p>To your health,</p>
        <p>The NutriGuide Team</p>
      `,
    });

    if (error) throw new Error(error.message);

    await prisma.emailLog.create({
      data: {
        to,
        subject: "Welcome to NutriGuide",
        type: "WELCOME",
        status: "SENT"
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Email error:", err);
    return { success: false, error: err.message };
  }
}
