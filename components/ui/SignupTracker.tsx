"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function SignupTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      // Track signup metadata
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

      // Sync marketing consent from cookie (set on login/signup page)
      const consentCookie = getCookie("marketing_consent");
      if (consentCookie === "true") {
        const consentKey = `synced_consent_${session.user.id}`;
        const hasSynced = sessionStorage.getItem(consentKey);
        if (!hasSynced) {
          fetch("/api/auth/update-consent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ consent: true }),
          }).then((res) => {
            if (res.ok) {
              sessionStorage.setItem(consentKey, "true");
              // Clear the cookie after syncing
              document.cookie = "marketing_consent=; path=/; max-age=0";
            }
          }).catch(err => console.error("Consent sync error:", err));
        }
      }
    }
  }, [status, session]);

  return null;
}
