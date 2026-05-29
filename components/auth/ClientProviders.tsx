"use client";

import { SessionProvider } from "next-auth/react";
import { SignupTracker } from "@/components/ui/SignupTracker";
import { EmailVerificationOverlay } from "@/components/ui/EmailVerificationOverlay";
import { BotpressChat } from "@/components/ui/BotpressChatWrapper";

/**
 * ClientProviders wraps all client-side providers and utilities.
 * 
 * In Next.js App Router, passing server component children through a client
 * component's {children} prop does NOT force those children to become client
 * components. The children are still server-rendered on the server, and the
 * client boundary only applies to THIS component's own code.
 * 
 * This means the SessionProvider wrapper here will NOT cause a
 * BAILOUT_TO_CLIENT_SIDE_RENDERING for the page content passed as children,
 * as long as the children themselves are server components.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SignupTracker />
      <EmailVerificationOverlay />
      <BotpressChat />
      {children}
    </SessionProvider>
  );
}
