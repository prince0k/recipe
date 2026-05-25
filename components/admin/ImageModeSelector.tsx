"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ImageIcon, FileText } from "lucide-react";

export function ImageModeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Default to prompt since user prefers prompt-only by default
  const currentMode = searchParams.get("imageMode") || "prompt";

  const handleModeChange = (mode: "image" | "prompt") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("imageMode", mode);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shadow-inner">
      <button
        type="button"
        onClick={() => handleModeChange("image")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          currentMode === "image"
            ? "bg-white text-emerald-700 shadow-sm border border-slate-200/30"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
        Active Image
      </button>
      <button
        type="button"
        onClick={() => handleModeChange("prompt")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          currentMode === "prompt"
            ? "bg-white text-amber-700 shadow-sm border border-slate-200/30"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <FileText className="w-3.5 h-3.5 text-amber-600" />
        Prompt Only
      </button>
    </div>
  );
}
