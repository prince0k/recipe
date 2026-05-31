import React from "react";

export function RecipesHero() {
  return (
    <div className="bg-[#f0efde] py-6 md:py-10 xl:py-20 border-b border-[#e8e4dc]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[#7a3010] font-sans font-bold tracking-widest uppercase text-xs mb-3 block">
          Handpicked Collection
        </span>
        <h1 className="text-[28px] md:text-[40px] xl:text-[64px] font-serif font-bold text-[#2c1e11] leading-tight mb-4 md:mb-6">
          Our Recipes
        </h1>
        <p className="text-base md:text-xl text-[#5d4037] font-serif italic max-w-2xl mx-auto leading-relaxed">
          From 15-minute quick fixes to slow-roasted weekend feasts. Every recipe is crafted for real life.
        </p>
      </div>
    </div>
  );
}
