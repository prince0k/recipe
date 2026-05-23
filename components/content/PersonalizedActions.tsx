"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export function PersonalizedActions() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-4">
      <Button 
        variant="outline" 
        className="rounded-full px-6 flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm"
        onClick={handlePrint}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print / Save PDF
      </Button>
    </div>
  );
}
