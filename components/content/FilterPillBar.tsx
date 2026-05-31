"use client";

import React from "react";

interface FilterPillBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenModal: () => void;
  hasActiveAdvancedFilters: boolean;
}

const CATEGORIES_LIST = [
  { name: "All", slug: "" },
  { name: "Quick Recipes", slug: "quick-recipes" },
  { name: "Healthy Eating", slug: "healthy-eating" },
  { name: "Budget Friendly", slug: "budget-friendly" },
  { name: "Breakfast", slug: "breakfast" },
  { name: "Lunch", slug: "lunch" },
  { name: "Dinner", slug: "dinner" },
];

export function FilterPillBar({
  activeCategory,
  onSelectCategory,
  onOpenModal,
  hasActiveAdvancedFilters,
}: FilterPillBarProps) {
  return (
    <div className="lg:hidden w-full mb-8 print-hide">
      <div className="flex overflow-x-auto gap-2.5 pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`snap-start px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-[#7a3010] text-white shadow-sm"
                  : "bg-[#f0efde] hover:bg-[#e6e4cf] text-[#2c1e11] border border-[#e8e4dc]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {/* Filters Button */}
        <button
          onClick={onOpenModal}
          className={`snap-start px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            hasActiveAdvancedFilters
              ? "bg-[#7a3010] text-white shadow-sm"
              : "bg-[#f5f3e9] hover:bg-[#eae7dc] text-[#2c1e11] border border-[#e8e4dc]"
          }`}
        >
          <span>⧉</span> Filters
          {hasActiveAdvancedFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          )}
        </button>
      </div>
    </div>
  );
}
