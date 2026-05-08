"use client";

import { useSession } from "next-auth/react";
import Script from "next/script";

export function BotpressChat() {
  const { status } = useSession();

  if (status !== "authenticated") return null;

  return (
    <>
      <Script 
        src="https://cdn.botpress.cloud/webchat/v3.6/inject.js" 
        strategy="afterInteractive" 
      />
      <Script 
        src="https://files.bpcontent.cloud/2026/05/08/03/20260508032825-857HT899.js" 
        strategy="afterInteractive"
        defer
      />
    </>
  );
}
