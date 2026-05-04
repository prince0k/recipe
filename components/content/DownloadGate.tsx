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
        className="w-full bg-[#10b981] hover:bg-[#059669] text-white shadow-lg"
      >
        Download Free PDF
      </Button>

      {/* Options Modal */}
      <Modal isOpen={showOptionsModal} onClose={() => setShowOptionsModal(false)} title="Choose Download Option">
        <div className="space-y-4 pt-2">
          <button 
            onClick={handleGeneralDownload}
            disabled={isLoading}
            className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-[#10b981] hover:shadow-md transition-all group"
          >
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#10b981]">General PDF (Instant)</h4>
            <p className="text-sm text-gray-500 mt-1">Download the standard version immediately.</p>
          </button>
          
          <button 
            onClick={handlePersonalisedRequest}
            className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-[#10b981] hover:shadow-md transition-all group bg-green-50/50"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-[#10b981]">Personalised Plan 🌟</h4>
              <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-1 rounded">Recommended</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Answer 7 quick questions and we'll generate a custom version just for your body type and goals.</p>
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
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Sign up to continue">
        <div className="space-y-6 pt-2">
          <p className="text-gray-600">
            You need a free account to access personalised plans and unlimited downloads!
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={() => router.push(`/signup?redirect=/${content.id}`)} className="w-full">
              Create Free Account
            </Button>
            <div className="text-center text-sm text-gray-500 my-2">Or</div>
            <Button variant="outline" onClick={() => router.push(`/login?redirect=/${content.id}`)} className="w-full">
              Log in to existing account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
