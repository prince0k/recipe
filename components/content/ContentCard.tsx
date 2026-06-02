"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadsLoader } from "@/lib/image-loader";

interface ContentCardProps {
  type: "RECIPE" | "DIET_PLAN" | "CHEAT_SHEET" | "BLOG";
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage?: string | null;
  tags?: string[];
  hrefPrefix: string;
  reviews?: { rating: number }[];
  createdAt?: string | Date;
}

export function ContentCard({ 
  type, 
  title, 
  slug, 
  excerpt, 
  coverImage, 
  tags = [], 
  hrefPrefix, 
  reviews,
  createdAt
}: ContentCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const avgRating = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const reviewCount = reviews ? reviews.length : 0;

  // Formatting date: e.g. "May 2026"
  const formattedDate = React.useMemo(() => {
    const dateObj = createdAt ? new Date(createdAt) : new Date("2026-05-01");
    return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [createdAt]);

  // Read time calculation: e.g. "6 min read"
  const readTime = React.useMemo(() => {
    const textLength = (excerpt?.length || 0) + title.length;
    return Math.max(3, Math.ceil(textLength / 180));
  }, [excerpt, title]);

  const typeLabels = {
    RECIPE: "Recipe",
    DIET_PLAN: "Diet Plan",
    CHEAT_SHEET: "Cheat Sheet",
    BLOG: "Article"
  };

  const actionLabels = {
    RECIPE: "View recipe",
    DIET_PLAN: "View plan",
    CHEAT_SHEET: "Get cheat sheet",
    BLOG: "Read article"
  };

  const badgeText = tags.length > 0 ? tags[0] : typeLabels[type];

  const showImage = coverImage && !imgError;
  const isLocalWebP = coverImage?.startsWith('/uploads/images/') && coverImage.endsWith('.webp');

  return (
    <Link href={`/${hrefPrefix}/${slug}`} className="block group h-full">
      <div className="h-full flex flex-col transition-all duration-500 hover:-translate-y-2 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-[#1e1c1a] border border-white/5 overflow-hidden shadow-2xl">
        
        {/* Top Image Section */}
        <div className="relative w-full h-44 sm:h-52 md:h-64 overflow-hidden bg-[#141211]">
          {showImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
              loader={isLocalWebP ? uploadsLoader : undefined}
              unoptimized={!isLocalWebP && coverImage?.startsWith('/uploads')}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20">
              <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium font-serif italic">{typeLabels[type]}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1c1a] via-transparent to-transparent opacity-60" />
          
          {/* Badge at the top left */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#b84a1e] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase border-none block">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Text Details Section */}
        <div className="p-4 sm:p-5 md:p-7 flex flex-col flex-grow bg-[#242220]">
          
          {/* Author · Read Time · Date */}
          <div className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-zinc-400 tracking-wider mb-2 sm:mb-3 uppercase flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span>By Stewart Lucas</span>
            <span className="text-zinc-600 font-bold">•</span>
            <span>{readTime} min read</span>
            <span className="text-zinc-600 font-bold">•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif text-white mb-2 sm:mb-3 group-hover:text-[#e77443] transition-colors line-clamp-2 leading-tight tracking-tight">
            {title}
          </h3>

          {/* Review Stars for Recipes */}
          {type === "RECIPE" && reviewCount > 0 && (
            <div className="flex items-center gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(avgRating) ? 'text-amber-400' : 'text-zinc-700'} style={{ fontSize: '13px' }}>
                  ★
                </span>
              ))}
              <span className="text-[10px] font-bold text-zinc-500 ml-1">({reviewCount})</span>
            </div>
          )}

          {/* Excerpt */}
          <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6 flex-grow leading-relaxed italic">
            {excerpt || ""}
          </p>

          {/* Read Link */}
          <div className="mt-auto">
            <span className="text-[#b84a1e] font-bold text-sm flex items-center group-hover:translate-x-1.5 transition-transform duration-300">
              {actionLabels[type]} <span className="ml-1.5 font-sans">→</span>
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
}
