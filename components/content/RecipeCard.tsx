"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadsLoader } from "@/lib/image-loader";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage?: string | null;
    tags?: string | string[];
    cookingTime?: string | null;
    difficulty?: string | null;
    type: string;
    reviews?: { rating: number }[];
    createdAt?: string | Date;
  };
  className?: string;
}

export function RecipeCard({ recipe, className = "" }: RecipeCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const avgRating = React.useMemo(() => {
    if (!recipe.reviews || recipe.reviews.length === 0) return 0;
    return recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length;
  }, [recipe.reviews]);

  const reviewCount = recipe.reviews ? recipe.reviews.length : 0;

  // Formatting date: e.g. "May 2026"
  const formattedDate = React.useMemo(() => {
    const dateObj = recipe.createdAt ? new Date(recipe.createdAt) : new Date("2026-05-01");
    return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [recipe.createdAt]);

  const readTime = React.useMemo(() => {
    const textLength = (recipe.excerpt?.length || 0) + recipe.title.length;
    return Math.max(3, Math.ceil(textLength / 180));
  }, [recipe.excerpt, recipe.title]);

  const tagsList = React.useMemo(() => {
    try {
      if (!recipe.tags) return [];
      return typeof recipe.tags === "string" ? JSON.parse(recipe.tags) : recipe.tags;
    } catch (e) {
      return [];
    }
  }, [recipe.tags]);

  const badgeText = tagsList.length > 0 ? tagsList[0] : "Recipe";

  const showImage = recipe.coverImage && !imgError;
  const isLocalWebP = recipe.coverImage?.startsWith('/uploads/images/') && recipe.coverImage.endsWith('.webp');

  return (
    <Link href={`/recipes/${recipe.slug}`} className={`block group h-full ${className}`}>
      <div className="h-full flex flex-col rounded-[10px] bg-white border border-[#e8e4dc] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1">
        
        {/* Top Image Section - Aspect Ratio 4:3 */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f5f3e9]">
          {showImage ? (
            <Image
              src={recipe.coverImage!}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              loader={isLocalWebP ? uploadsLoader : undefined}
              unoptimized={!isLocalWebP && recipe.coverImage?.startsWith('/uploads')}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-serif italic text-zinc-400">Recipe</span>
            </div>
          )}
          
          {/* Badge at the top left */}
          <div className="absolute top-3 left-3">
            <span className="bg-[#7a3010] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide uppercase">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Text Details Section */}
        <div className="p-5 flex flex-col flex-grow text-left">
          {/* Read Time & Date */}
          <div className="text-[10px] font-bold text-[#5d4037]/80 tracking-wider mb-2.5 uppercase flex items-center gap-1.5">
            <span>{readTime} min read</span>
            <span className="text-zinc-300">•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title - Clamped to 2 lines max */}
          <h3 className="text-base font-serif font-bold text-[#2c1e11] mb-2 group-hover:text-[#7a3010] transition-colors line-clamp-2 leading-snug tracking-tight">
            {recipe.title}
          </h3>

          {/* Review Stars */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(avgRating) ? 'text-[#7a3010]' : 'text-zinc-200'} style={{ fontSize: '13px' }}>
                  ★
                </span>
              ))}
              <span className="text-[10px] font-bold text-zinc-400 ml-1">({reviewCount})</span>
            </div>
          )}

          {/* Excerpt */}
          <p className="text-[#5d4037] text-xs line-clamp-2 mb-4 leading-relaxed font-sans">
            {recipe.excerpt || ""}
          </p>

          {/* CTA Link at the bottom */}
          <div className="mt-auto pt-2 border-t border-[#e8e4dc]/60">
            <span className="text-[#7a3010] font-bold text-xs flex items-center group-hover:translate-x-1 transition-transform duration-300">
              View recipe <span className="ml-1 font-sans">→</span>
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
}
