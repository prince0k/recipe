"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkPublishButtonProps {
  ids: string[];
  label: string;
}

export function BulkPublishButton({ ids, label }: BulkPublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (ids.length === 0) return null;

  const handleBulkPublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(
      `Are you sure you want to publish all ${ids.length} draft ${label}? They will become instantly visible on the website.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/bulk-publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully published ${data.count} items!`);
        router.refresh();
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Bulk publish error:", err);
      alert("Failed to publish content due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBulkPublish}
      disabled={loading}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-emerald-950/20 active:scale-98 font-bold text-xs sm:text-sm px-4 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <CheckSquare className="w-4 h-4 text-white" />
      )}
      {loading ? "Publishing..." : `Publish All Drafts (${ids.length})`}
    </Button>
  );
}
