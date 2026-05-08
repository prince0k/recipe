"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  contentId: string;
  initialFavorited?: boolean;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({ 
  contentId, 
  initialFavorited = false, 
  variant = "default",
  className = "",
  showText = true 
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If not provided as initial prop, we could fetch it, 
    // but usually it's passed from a server component for efficiency
  }, [contentId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.favorited);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={`group transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${className}`}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 transition-colors ${isFavorited ? "fill-red-500 stroke-red-500" : "fill-none stroke-current group-hover:stroke-red-500"}`} 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {showText && (isFavorited ? "Saved to Favorites" : "Save to Favorites")}
    </Button>
  );
}
