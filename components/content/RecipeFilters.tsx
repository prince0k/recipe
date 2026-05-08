"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CATEGORIES = ["Quick Recipes", "Healthy Eating", "Budget Friendly", "Breakfast", "Lunch", "Dinner"];
const TIMES = ["Under 15 mins", "15-30 mins", "30-60 mins", "1 hour+"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten Free", "Dairy Free"];

export function RecipeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedTime, setSelectedTime] = useState(searchParams.get("time") || "");
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    searchParams.get("dietary")?.split(",") || []
  );

  // Sync state with URL when it changes
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedTime(searchParams.get("time") || "");
    setSelectedDietary(searchParams.get("dietary")?.split(",") || []);
  }, [searchParams]);

  const updateFilters = (newParams: Record<string, string | string[] | null>) => {
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
    // Reset page on filter change
    params.set("page", "1");
    router.push(`/recipes?${params.toString()}`, { scroll: false });
  };

  const handleDietaryChange = (diet: string) => {
    const newDietary = selectedDietary.includes(diet)
      ? selectedDietary.filter(d => d !== diet)
      : [...selectedDietary, diet];
    setSelectedDietary(newDietary);
    updateFilters({ dietary: newDietary });
  };

  return (
    <div className="sticky top-28 space-y-10">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center group cursor-pointer">
              <input 
                type="radio" 
                name="category"
                checked={selectedCategory === cat}
                onChange={() => {
                  const val = selectedCategory === cat ? "" : cat;
                  setSelectedCategory(val);
                  updateFilters({ category: val });
                }}
                className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary mr-3" 
              />
              <span className={`transition-colors ${selectedCategory === cat ? "text-primary font-bold" : "text-text-muted group-hover:text-primary"}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Cooking Time</h3>
        <div className="space-y-3">
          {TIMES.map((t) => (
            <label key={t} className="flex items-center group cursor-pointer">
              <input 
                type="radio" 
                name="time" 
                checked={selectedTime === t}
                onChange={() => {
                  const val = selectedTime === t ? "" : t;
                  setSelectedTime(val);
                  updateFilters({ time: val });
                }}
                className="w-4 h-4 border-border text-primary focus:ring-primary mr-3" 
              />
              <span className={`transition-colors ${selectedTime === t ? "text-primary font-bold" : "text-text-muted group-hover:text-primary"}`}>
                {t}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text mb-6 border-b border-border pb-2">Dietary</h3>
        <div className="space-y-3">
          {DIETARY.map((diet) => (
            <label key={diet} className="flex items-center group cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedDietary.includes(diet)}
                onChange={() => handleDietaryChange(diet)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3" 
              />
              <span className={`transition-colors ${selectedDietary.includes(diet) ? "text-primary font-bold" : "text-text-muted group-hover:text-primary"}`}>
                {diet}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          setSelectedCategory("");
          setSelectedTime("");
          setSelectedDietary([]);
          router.push("/recipes");
        }}
        className="text-xs font-bold text-primary underline uppercase tracking-widest hover:text-primary-dark transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

export function RecipeSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  const handleSort = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", val);
    router.push(`/recipes?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Sort by:</span>
      <select 
        value={sort}
        onChange={(e) => handleSort(e.target.value)}
        className="bg-transparent border-none text-text font-bold focus:ring-0 cursor-pointer"
      >
        <option value="newest">Most Recent</option>
        <option value="oldest">Oldest</option>
        <option value="fastest">Quickest</option>
      </select>
    </div>
  );
}
