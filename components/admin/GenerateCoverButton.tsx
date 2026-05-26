"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GenerateCoverButtonProps {
  id: string;
  title: string;
}

export function GenerateCoverButton({ id, title }: GenerateCoverButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(`Generate AI cover image for "${title}" using Fal.ai Flux?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/generate-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully generated cover image for "${title}"!`);
        router.refresh();
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Failed to generate cover image due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 rounded-xl text-xs py-1.5 px-3 shadow-sm font-semibold disabled:opacity-50 transition-all duration-200"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
      ) : (
        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
      )}
      {loading ? "Generating..." : "Generate Cover Image"}
    </Button>
  );
}
