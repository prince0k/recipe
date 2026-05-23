"use client";

import React, { useEffect, useRef } from "react";

interface AdScriptRendererProps {
  adCode: string;
}

export function AdScriptRenderer({ adCode }: AdScriptRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous contents
    containerRef.current.innerHTML = "";
    
    try {
      // Use createContextualFragment to ensure script tags inside the HTML are parsed and executed
      const range = document.createRange();
      range.selectNode(containerRef.current);
      const fragment = range.createContextualFragment(adCode);
      containerRef.current.appendChild(fragment);
    } catch (err) {
      console.error("Failed to inject ad script code:", err);
      // Fallback to standard innerHTML (scripts won't execute but HTML will show)
      containerRef.current.innerHTML = adCode;
    }
  }, [adCode]);

  return <div ref={containerRef} className="w-full flex justify-center overflow-hidden" />;
}
