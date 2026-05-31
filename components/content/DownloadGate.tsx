"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface DownloadGateProps {
  content: any;
}

export function DownloadGate({ content }: DownloadGateProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState("");

  const handleRequest = async (targetEmail?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/downloads/request-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          ...(targetEmail && { email: targetEmail }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSentEmail(targetEmail || session?.user?.email || "");
        setShowEmailModal(false);
        setShowSuccessModal(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetClick = () => {
    if (session) {
      handleRequest();
    } else {
      setShowEmailModal(true);
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    handleRequest(email);
  };

  return (
    <>
      <Button
        onClick={handleGetClick}
        size="lg"
        className="w-full font-semibold cursor-pointer"
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Sending..." : "Get"}
      </Button>

      {/* Email Request Modal for Logged-Out Users */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Get the Full Guide"
      >
        <form onSubmit={handleModalSubmit} className="space-y-6 pt-2 text-left">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter your email below to receive a direct download link for the printable version of <strong className="text-foreground">{content.title}</strong>.
          </p>

          <div className="space-y-2">
            <label htmlFor="gate-email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              id="gate-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-secondary/50 p-3.5 text-sm text-foreground placeholder-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-red-550 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEmailModal(false)}
              className="w-full sm:w-1/3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full sm:w-2/3"
            >
              {isLoading ? "Sending..." : "Send Guide"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Guide Sent! 📩"
      >
        <div className="space-y-6 pt-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We've sent the printable guide for <strong>{content.title}</strong> directly to:
            </p>
            <p className="text-base font-bold text-foreground">
              {sentEmail}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Please check your inbox or spam folder in a few moments.
            </p>
          </div>

          <Button onClick={() => setShowSuccessModal(false)} className="w-full mt-2">
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
