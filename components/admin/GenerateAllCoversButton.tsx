"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CoverItem {
  id: string;
  title: string;
}

interface GenerateAllCoversButtonProps {
  items: CoverItem[];
}

export function GenerateAllCoversButton({ items }: GenerateAllCoversButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const router = useRouter();

  if (items.length === 0) return null;

  const handleGenerateAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(
      `Generate AI cover images for all ${items.length} draft items using Fal.ai Flux? This will process them one by one.`
    );
    if (!confirmed) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setProgress(`Generating ${i + 1}/${items.length}: "${item.title}"...`);

      try {
        const res = await fetch("/api/admin/ai/generate-cover", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: item.id }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to generate cover for "${item.title}":`, data.error || "Unknown error");
        }
      } catch (err) {
        failCount++;
        console.error(`Error generating cover for "${item.title}":`, err);
      }
    }

    setLoading(false);
    setProgress("");
    alert(`Bulk cover generation finished!\n\nSuccessful: ${successCount}\nFailed: ${failCount}`);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {loading && (
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
          {progress}
        </span>
      )}
      <Button
        onClick={handleGenerateAll}
        disabled={loading}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-amber-950/20 active:scale-98 font-bold text-xs sm:text-sm px-4 disabled:opacity-50"
      >
        <ImageIcon className="w-4 h-4 text-white" />
        {loading ? "Generating All..." : `Generate All Covers (${items.length})`}
      </Button>
    </div>
  );
}
