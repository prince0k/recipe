"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

export function VerificationPopup() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");

    if (verified === "true") {
      setShow(true);
      setIsError(false);
      // Auto hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }

    if (error) {
      setShow(true);
      setIsError(true);
      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
      <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
        isError ? "bg-red-500/10 border-red-500/20 text-red-600" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
      }`}>
        <div className={`p-2 rounded-xl ${isError ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">
            {isError ? "Verification Failed" : "Welcome to NutriGuide!"}
          </h4>
          <p className="text-xs opacity-90">
            {isError 
              ? "The verification link is invalid or has expired." 
              : "Your email has been confirmed. Login successful!"}
          </p>
        </div>
        <button 
          onClick={() => setShow(false)}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
