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
  const [showWizard, setShowWizard] = useState(false);

  const handlePersonalisedRequest = () => {
    if (!session) {
      setShowAuthModal(true);
    } else {
      setShowWizard(true);
    }
  };

  return (
    <>
      <Button
        onClick={handlePersonalisedRequest}
        size="lg"
        className="w-full"
      >
        Get
      </Button>

      {/* Auth Modal */}

      {/* Wizard Modal */}
      {showWizard && (
        <PersonalisedWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          content={content}
          isLoggedIn={!!session}
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
