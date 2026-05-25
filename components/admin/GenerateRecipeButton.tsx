"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GenerateRecipeButtonProps {
  id: string;
  title: string;
  imageMode?: string;
}

export function GenerateRecipeButton({ id, title, imageMode = "prompt" }: GenerateRecipeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(`Generate AI recipe details for "${title}"? This process will take 5-10 seconds.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/generate-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, imageMode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully generated recipe for "${title}" as a draft!`);
        router.refresh();
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Generate error:", err);
      alert("Failed to generate recipe due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-xs py-1.5 px-3 shadow-sm font-semibold disabled:opacity-50 transition-all duration-200"
    >
      <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Generating..." : "Generate AI Recipe"}
    </Button>
  );
}
