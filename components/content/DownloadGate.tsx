"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PersonalisedWizard } from "./PersonalisedWizard";

interface DownloadGateProps {
  content: any;
}

export function DownloadGate({ content }: DownloadGateProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const handleGeneralDownload = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: content.id }),
      });

      const data = await res.json();

      if (res.status === 401 && data.requiresAuth) {
        setShowOptionsModal(false);
        setShowAuthModal(true);
      } else if (res.ok) {
        if (content.downloadUrl) {
          window.open(content.downloadUrl, "_blank");
        } else {
          alert("File is not available right now.");
        }
      } else {
        alert(data.message || "An error occurred.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalisedRequest = () => {
    if (!session) {
      setShowOptionsModal(false);
      setShowAuthModal(true);
    } else {
      setShowOptionsModal(false);
      setShowWizard(true);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowOptionsModal(true)}
        size="lg"
        className="w-full"
      >
        Download Free PDF
      </Button>

      {/* Options Modal */}
      <Modal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        title="Choose Download Option"
      >
        <div className="space-y-4 pt-2">
          <button
            onClick={handleGeneralDownload}
            disabled={isLoading}
            className="w-full rounded-lg border border-border p-4 text-left transition-all hover:border-foreground/30 hover:bg-secondary/50"
          >
            <h4 className="font-semibold text-foreground">
              General PDF (Instant)
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Download the standard version immediately.
            </p>
          </button>

          <button
            onClick={handlePersonalisedRequest}
            className="w-full rounded-lg border border-border bg-secondary/50 p-4 text-left transition-all hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">
                Personalised Plan
              </h4>
              <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                Recommended
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer 7 quick questions and we&apos;ll generate a custom version
              just for your body type and goals.
            </p>
          </button>
        </div>
      </Modal>

      {/* Wizard Modal */}
      {showWizard && (
        <PersonalisedWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          content={content}
        />
      )}

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign up to continue"
      >
        <div className="space-y-6 pt-2">
          <p className="text-muted-foreground">
            You need a free account to access personalised plans and unlimited
            downloads.
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push(`/signup?redirect=/${content.id}`)}
              className="w-full"
            >
              Create Free Account
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/login?redirect=/${content.id}`)}
              className="w-full"
            >
              Log in to existing account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
