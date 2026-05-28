"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mail, LogOut, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function EmailVerificationOverlay() {
  const { data: session, status } = useSession();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (status !== "authenticated" || !session?.user) return null;

  // Show overlay if emailVerified is null or undefined
  if (session.user.emailVerified) return null;

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "A new verification link has been sent to your email.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to resend verification email.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
          <Mail className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-foreground">Confirm your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ve sent a verification link to <strong className="text-foreground">{session.user.email}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-left text-sm ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" 
              : "bg-red-500/10 border-red-500/20 text-red-600"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleResend}
            isLoading={isResending}
            variant="primary"
            className="w-full h-11"
          >
            {!isResending && <RefreshCw className="mr-2 h-4 w-4" />}
            Resend Verification Email
          </Button>

          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            variant="outline"
            className="w-full h-11"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out / Cancel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Once verified, refresh this page or re-login to access the site.
        </p>

      </div>
    </div>
  );
}
