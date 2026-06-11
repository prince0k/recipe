"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecipeCard } from "./RecipeCard";
import { FilterPillBar } from "./FilterPillBar";
import { FilterModal } from "./FilterModal";
import { RecipeFilters, RecipeSort } from "./RecipeFilters";
import { CategoryPanel } from "./CategoryPanel";

interface RecipesClientProps {
  recipes: any[];
  totalPages: number;
  currentPage: number;
  categories: any[];
}

const CATEGORIES = ["Quick Recipes", "Healthy Eating", "Budget Friendly", "Breakfast", "Lunch", "Dinner"];
const CATEGORY_MAP: Record<string, string> = {
  "quick-recipes": "Quick Recipes",
  "healthy-eating": "Healthy Eating",
  "budget-friendly": "Budget Friendly",
  "dinner-ideas": "Dinner",
  "dinner": "Dinner",
  "breakfast": "Breakfast",
  "lunch": "Lunch",
};

const toSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};

const getCategoryDisplayName = (slug: string | null) => {
  if (!slug) return "";
  return CATEGORY_MAP[slug] || slug;
};

function matchesCategory(recipe: any, category: string) {
  if (!category) return true;
  const catLower = category.toLowerCase();
  
  let tagsList: string[] = [];
  try {
    if (recipe.tags) {
      tagsList = typeof recipe.tags === "string" 
        ? JSON.parse(recipe.tags) 
        : recipe.tags;
    }
  } catch (e) {}
  
  const tagsStr = tagsList.join(" ").toLowerCase();

  if (catLower === "quick-recipes" || catLower === "quick recipes") {
    return ["quick", "easy", "one-pan", "sheet-pan", "breakfast", "meal-prep", "fast"].some(
      tag => tagsStr.includes(tag)
    );
  }
  if (catLower === "healthy-eating" || catLower === "healthy eating") {
    return ["healthy", "nutrition", "plant-based", "vegan", "vegetarian", "gluten-free", "low-carb", "sugar-free", "fiber", "wellness", "gut-health", "biohacking"].some(
      tag => tagsStr.includes(tag)
    );
  }
  if (catLower === "budget-friendly" || catLower === "budget friendly" || catLower === "budget") {
    return ["budget", "inflation-proof", "cheap", "pantry"].some(
      tag => tagsStr.includes(tag)
    );
  }
  if (catLower === "dinner-ideas" || catLower === "dinner") {
    return ["dinner", "roast", "bowl", "skillet", "main", "lunch", "meal"].some(
      tag => tagsStr.includes(tag)
    );
  }
  if (catLower === "breakfast") {
    return ["breakfast", "smoothie", "loaf", "baking", "skillet"].some(
      tag => tagsStr.includes(tag)
    );
  }
  if (catLower === "lunch") {
    return ["lunch", "bowl", "skillet", "salad", "soup"].some(
      tag => tagsStr.includes(tag)
    );
  }
  return tagsStr.includes(catLower);
}

export function RecipesClient({ recipes, totalPages, currentPage, categories }: RecipesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [selectedTime, setSelectedTime] = useState(searchParams.get("time") || "");
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    searchParams.get("dietary")?.split(",") || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state with URL changes
  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "");
    setSelectedTime(searchParams.get("time") || "");
    setSelectedDietary(searchParams.get("dietary")?.split(",") || []);
  }, [searchParams]);

  // Filter recipes client-side
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => matchesCategory(recipe, activeCategory));
  }, [recipes, activeCategory]);

  const updateURLFilters = (newParams: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(","));
          else params.delete(key);
        } else {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1"); // reset to page 1
    router.push(`/recipes?${params.toString()}`, { scroll: false });
  };

  const handleSelectCategory = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    updateURLFilters({ category: categorySlug || null });
  };

  const handleApplyModalFilters = (time: string, dietary: string[]) => {
    setSelectedTime(time);
    setSelectedDietary(dietary);
    updateURLFilters({
      time: time || null,
      dietary: dietary.length > 0 ? dietary : null,
    });
  };

  const hasActiveAdvancedFilters = !!selectedTime || selectedDietary.length > 0;

  return (
    <div className="w-full flex flex-col">
      {/* Category Selection Panel */}
      <CategoryPanel
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
      {/* Category Pill Bar (visible < 1024px) */}
      <FilterPillBar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenModal={() => setIsModalOpen(true)}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
      />

      {/* Advanced Filter Modal */}
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTime={selectedTime}
        selectedDietary={selectedDietary}
        onApply={handleApplyModalFilters}
      />

      {/* Desktop left sidebar layout (hidden < 1024px) */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <RecipeFilters />
      </aside>

      {/* Recipes Listing Content Area */}
      <main className="flex-grow w-full">
        {/* Count & Sort Header */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#e8e4dc]">
          <p className="text-[#5d4037] font-serif italic text-sm md:text-base transition-all duration-300">
            {filteredRecipes.length} recipes found
          </p>
          <RecipeSort />
        </div>

        {/* Recipes Card Grid with Responsive Columns */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[10px] border border-[#e8e4dc] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <svg className="w-16 h-16 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-[#5d4037] font-serif italic text-base">No recipes match your active filters.</p>
            <button
              onClick={() => {
                setActiveCategory("");
                setSelectedTime("");
                setSelectedDietary([]);
                router.push("/recipes");
              }}
              className="mt-6 text-[#7a3010] font-bold underline cursor-pointer text-sm"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10 transition-all duration-500 ease-in-out">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="transition-all duration-500 transform opacity-100 scale-100"
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
