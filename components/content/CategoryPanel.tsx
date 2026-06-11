"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  tag: string;
  order: number;
}

interface CategoryPanelProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryPanel({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!categories || categories.length === 0) {
    return null;
  }

  // Determine initial count based on viewport (we will manage this using CSS classes or JS state)
  // To keep it simple and responsive:
  // Desktop/Tablet: Show 10 items max when collapsed
  // Mobile: We can show all 8 we seeded or show a limit.
  // Let's set the desktop threshold to 10 and mobile to 6.
  const threshold = 10;
  const showToggle = categories.length > threshold;
  const visibleCategories = isExpanded ? categories : categories.slice(0, threshold);

  return (
    <div className="w-full mb-12 border-b border-[#e8e4dc]/70 pb-12 print-hide">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-[#2c1e11]">
          Browse by category
        </h2>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 transition-all duration-500 ease-in-out">
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.slug;
          const initials = category.name.slice(0, 2).toUpperCase();

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(isActive ? "" : category.slug)}
              className={`relative h-28 md:h-32 rounded-2xl overflow-hidden cursor-pointer group border border-[#e8e4dc]/50 transition-all duration-300 focus:outline-none shadow-sm hover:shadow-md ${
                isActive
                  ? "ring-4 ring-[#7a3010] scale-[1.01]"
                  : "hover:scale-[1.02]"
              }`}
            >
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#7a3010] to-[#5d4037] flex items-center justify-center font-bold text-white text-lg">
                  {initials}
                </div>
              )}

              {/* Dark overlay */}
              <div className={`absolute inset-0 bg-black/40 transition-colors duration-300 ${
                isActive ? "bg-black/25" : "group-hover:bg-black/45"
              }`} />

              {/* Category Name Text */}
              <span className="absolute inset-0 flex items-center justify-center text-white font-sans font-bold text-base md:text-lg tracking-wider px-3 text-center transition-all duration-300 select-none">
                {category.name}
              </span>

              {/* Active selection dot or indicator */}
              {isActive && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-[#7a3010] border border-white rounded-full shadow-sm animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* See more toggle */}
      {showToggle && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-[#f5f3e9] hover:bg-[#e8e4dc] text-[#5d4037] font-sans font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3 transition-all duration-200 border border-[#e8e4dc]/60 shadow-sm cursor-pointer active:scale-95"
          >
            {isExpanded ? (
              <>
                See less <ChevronUp className="w-4 h-4 text-[#7a3010]" />
              </>
            ) : (
              <>
                See more <ChevronDown className="w-4 h-4 text-[#7a3010]" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
