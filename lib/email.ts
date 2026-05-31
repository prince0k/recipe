import { prisma } from "./db";

/**
 * Send a welcome email via the Email-Core → Sender Server → PMTA pipeline.
 *
 * Flow: Recipe Site → email-core API → Sender Server PHP → PMTA → Recipient
 *
 * Requires these env vars:
 *   EMAIL_CORE_URL      – e.g. https://blastbees.com
 *   EMAIL_CORE_API_KEY  – the SENDER_INTERNAL_KEY shared with email-core
 *   SITE_URL            – public URL of this recipe site
 *   SITE_NAME           – brand name (defaults to "NutriGuide")
 */

const EMAIL_CORE_URL = process.env.EMAIL_CORE_URL || "";
const EMAIL_CORE_API_KEY = process.env.EMAIL_CORE_API_KEY || "";
const SITE_URL = process.env.SITE_URL || process.env.AUTH_URL || "https://stewartlucas.com";
const SITE_NAME = process.env.SITE_NAME || "NutriGuide";

export async function sendWelcomeEmail(to: string, name: string) {
  try {

    /* ── Guard: skip if email-core is not configured ──────── */
    if (!EMAIL_CORE_URL || !EMAIL_CORE_API_KEY) {
      console.warn("[email] EMAIL_CORE_URL or EMAIL_CORE_API_KEY not set — skipping welcome email");
      return { success: false, error: "email_core_not_configured" };
    }

    /* ── Call email-core welcome endpoint ─────────────────── */
    const endpoint = `${EMAIL_CORE_URL.replace(/\/$/, "")}/api/welcome/send`;

    console.log(`[email] Sending welcome email to ${to} via ${endpoint}`);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": EMAIL_CORE_API_KEY,
      },
      body: JSON.stringify({
        email: to,
        name: name || "",
        siteUrl: SITE_URL,
        siteName: SITE_NAME,
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error(`[email] Welcome email failed (HTTP ${res.status}):`, data);
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    console.log(`[email] ✅ Welcome email sent to ${to}:`, data);

    /* ── Log in local DB ─────────────────────────────────── */
    await prisma.emailLog.create({
      data: {
        to,
        subject: `Welcome to ${SITE_NAME}`,
        type: "WELCOME",
        status: "SENT",
      },
    });

    return { success: true, messageId: data.messageId };

  } catch (err: any) {
    console.error("[email] Welcome email error:", err.message || err);

    // Log the failure but don't crash the subscription flow
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject: `Welcome to ${SITE_NAME}`,
          type: "WELCOME",
          status: "FAILED",
        },
      });
    } catch {
      // silently ignore logging failures
    }

    return { success: false, error: err.message };
  }
}

/**
 * Send a verification email with a unique token.
 */
export async function sendVerificationEmail(to: string, name: string) {
  try {
    console.log(`[email] Attempting verification for ${to}. Config: URL=${EMAIL_CORE_URL ? "SET" : "MISSING"}, KEY=${EMAIL_CORE_API_KEY ? "SET" : "MISSING"}`);
    
    if (!EMAIL_CORE_URL || !EMAIL_CORE_API_KEY) {
      console.warn("[email] Verification skipped: Missing EMAIL_CORE_URL or EMAIL_CORE_API_KEY");
      return { success: false };
    }

    // 1. Generate Token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: to,
        token,
        expires,
      },
    });

    const verifyUrl = `${SITE_URL}/api/verify?token=${token}&email=${encodeURIComponent(to)}`;

    // 2. Call email-core
    const endpoint = `${EMAIL_CORE_URL.replace(/\/$/, "")}/api/welcome/send-verify`;
    console.log(`[email] Calling Email-Core at: ${endpoint}`);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": EMAIL_CORE_API_KEY,
      },
      body: JSON.stringify({
        email: to,
        name: name || "",
        verifyUrl,
        siteName: SITE_NAME,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    console.log(`[email] Email-Core responded with status: ${res.status}`);

    if (!res.ok) throw new Error("Failed to send verification email");

    const data = await res.json();

    await prisma.emailLog.create({
      data: {
        to,
        subject: `Confirm your email - ${SITE_NAME}`,
        type: "VERIFICATION",
        status: "SENT",
      },
    });

    return { success: true, messageId: data.messageId };

  } catch (err: any) {
    console.error("[email] Verification email error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send an email notifying the user that their personalised plan is ready.
 */
export async function sendPersonalisedPlanReadyEmail({
  to,
  name,
  viewUrl,
}: {
  to: string;
  name: string;
  viewUrl: string;
}) {
  try {
    if (!EMAIL_CORE_URL || !EMAIL_CORE_API_KEY) {
      console.warn("[email] Personalised email skipped: Missing config");
      return { success: false };
    }

    const endpoint = `${EMAIL_CORE_URL.replace(/\/$/, "")}/api/welcome/send-personalised`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": EMAIL_CORE_API_KEY,
      },
      body: JSON.stringify({
        email: to,
        name: name || "",
        viewUrl,
        siteName: SITE_NAME,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error("Failed to send personalised ready email");

    const data = await res.json();

    await prisma.emailLog.create({
      data: {
        to,
        subject: `Your Personalised Plan is Ready! 🎉 - ${SITE_NAME}`,
        type: "PERSONALISED_READY",
        status: "SENT",
      },
    });

    return { success: true, messageId: data.messageId };

  } catch (err: any) {
    console.error("[email] Personalised ready email error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send an email notifying the user that their requested diet plan guide is ready for download.
 */
export async function sendDietPlanGuideEmail({
  to,
  name,
  guideTitle,
  downloadUrl,
}: {
  to: string;
  name: string;
  guideTitle: string;
  downloadUrl: string;
}) {
  try {
    if (!EMAIL_CORE_URL || !EMAIL_CORE_API_KEY) {
      console.warn("[email] Diet plan guide email skipped: Missing config");
      return { success: false };
    }

    const endpoint = `${EMAIL_CORE_URL.replace(/\/$/, "")}/api/welcome/send-guide`;

    console.log(`[email] Sending guide email to ${to} for ${guideTitle} via ${endpoint}`);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": EMAIL_CORE_API_KEY,
      },
      body: JSON.stringify({
        email: to,
        name: name || "",
        guideTitle,
        downloadUrl,
        siteName: SITE_NAME,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error("Failed to send diet plan guide email");

    const data = await res.json();

    await prisma.emailLog.create({
      data: {
        to,
        subject: `Your Guide is Ready: ${guideTitle} - ${SITE_NAME}`,
        type: "GUIDE_READY",
        status: "SENT",
      },
    });

    return { success: true, messageId: data.messageId };

  } catch (err: any) {
    console.error("[email] Diet plan guide email error:", err);
    return { success: false, error: err.message };
  }
}


