"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SignupTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const trackKey = `tracked_signup_${session.user.id}`;
      const hasTracked = sessionStorage.getItem(trackKey);
      
      if (!hasTracked) {
        fetch("/api/track-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenRes: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            referrer: document.referrer || null,
            pageUrl: window.location.href,
          })
        }).then((res) => {
          if (res.ok) {
            sessionStorage.setItem(trackKey, "true");
          }
        }).catch(err => console.error("Signup tracking error:", err));
      }
    }
  }, [status, session]);

  return null;
}
