"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface RecipeDetailCardProps {
  title: string;
  excerpt: string;
  coverImage: string | null;
  prepTime: string | null;
  cookingTime: string | null;
  servings: number | null;
  calories: number | null;
  fat: string | null;
  carbs: string | null;
  protein: string | null;
  difficulty: string | null;
  rating: number;
  reviewCount: number;
  avgRating: number;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  notes: string[];
  author: string;
}

// Helper to format decimal numbers to fractions
function decimalToFraction(val: number): string {
  const tolerance = 0.05;
  const integerPart = Math.floor(val);
  const decimalPart = val - integerPart;

  if (decimalPart < tolerance) {
    return integerPart.toString();
  }
  if (Math.abs(decimalPart - 0.25) < tolerance) {
    return integerPart > 0 ? `${integerPart} 1/4` : "1/4";
  }
  if (Math.abs(decimalPart - 0.5) < tolerance) {
    return integerPart > 0 ? `${integerPart} 1/2` : "1/2";
  }
  if (Math.abs(decimalPart - 0.75) < tolerance) {
    return integerPart > 0 ? `${integerPart} 3/4` : "3/4";
  }
  if (Math.abs(decimalPart - 0.33) < tolerance || Math.abs(decimalPart - 0.333) < tolerance) {
    return integerPart > 0 ? `${integerPart} 1/3` : "1/3";
  }
  if (Math.abs(decimalPart - 0.66) < tolerance || Math.abs(decimalPart - 0.667) < tolerance) {
    return integerPart > 0 ? `${integerPart} 2/3` : "2/3";
  }

  const rounded = Math.round(val * 100) / 100;
  return rounded.toString();
}

// Function to scale a single quantity string
function scaleQuantity(str: string, multiplier: number): string {
  if (multiplier === 1) return str;

  const trimmed = str.trim();

  // Pattern 1: Mixed fraction like "1 1/2" or "2 1/4"
  const mixedFractionRegex = /^(\d+)\s+(\d+)\/(\d+)(?:\s+(.*))?$/;
  let match = trimmed.match(mixedFractionRegex);
  if (match) {
    const whole = parseInt(match[1], 10);
    const num = parseInt(match[2], 10);
    const den = parseInt(match[3], 10);
    const rest = match[4] || "";
    const value = (whole + num / den) * multiplier;
    return `${decimalToFraction(value)} ${rest}`.trim();
  }

  // Pattern 2: Fraction like "1/2" or "3/4"
  const fractionRegex = /^(\d+)\/(\d+)(?:\s+(.*))?$/;
  match = trimmed.match(fractionRegex);
  if (match) {
    const num = parseInt(match[1], 10);
    const den = parseInt(match[2], 10);
    const rest = match[3] || "";
    const value = (num / den) * multiplier;
    return `${decimalToFraction(value)} ${rest}`.trim();
  }

  // Pattern 3: Range like "6-9" or "1.5-2.5"
  const rangeRegex = /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)(?:\s+(.*))?$/;
  match = trimmed.match(rangeRegex);
  if (match) {
    const startVal = parseFloat(match[1]) * multiplier;
    const endVal = parseFloat(match[2]) * multiplier;
    const rest = match[3] || "";
    return `${decimalToFraction(startVal)}-${decimalToFraction(endVal)} ${rest}`.trim();
  }

  // Pattern 4: Integer or Decimal like "2" or "1.5"
  const decimalRegex = /^(\d+(?:\.\d+)?)(?:\s+(.*))?$/;
  match = trimmed.match(decimalRegex);
  if (match) {
    const value = parseFloat(match[1]) * multiplier;
    const rest = match[2] || "";
    return `${decimalToFraction(value)} ${rest}`.trim();
  }

  return trimmed;
}

// Function to split ingredient into customary and metric parts
function parseCustomaryAndMetric(str: string) {
  const parentheticalRegex = /^(.*?)\s*\((?:approx\.\s*)?([^)]+)\)\s*(.*)$/i;
  const match = str.match(parentheticalRegex);
  if (match) {
    return {
      customary: (match[1] + " " + match[3]).trim(),
      metric: (match[2] + " " + match[3]).trim(),
      hasBoth: true
    };
  }
  return {
    customary: str,
    metric: str,
    hasBoth: false
  };
}

export function RecipeDetailCard({
  title,
  excerpt,
  coverImage,
  prepTime,
  cookingTime,
  servings,
  calories,
  fat,
  carbs,
  protein,
  difficulty,
  rating,
  reviewCount,
  avgRating,
  tags,
  ingredients,
  instructions,
  notes,
  author
}: RecipeDetailCardProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [useMetric, setUseMetric] = useState<boolean>(false);
  const [cookMode, setCookMode] = useState<boolean>(false);
  const [completedIngredients, setCompletedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const wakeLockRef = useRef<any>(null);

  // Handle Wake Lock for Cook Mode
  useEffect(() => {
    async function requestWakeLock() {
      if (!cookMode) {
        if (wakeLockRef.current) {
          try {
            await wakeLockRef.current.release();
          } catch (e) {}
          wakeLockRef.current = null;
        }
        return;
      }

      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await (navigator.wakeLock as any).request("screen");
          console.log("Screen Wake Lock is active");
        } catch (err: any) {
          console.warn(`Wake Lock failed: ${err.name}, ${err.message}`);
          setCookMode(false);
        }
      } else {
        console.warn("Wake Lock API not supported in this browser");
        setCookMode(false);
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [cookMode]);

  const handlePrint = () => {
    window.print();
  };

  const toggleIngredient = (idx: number) => {
    setCompletedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Compute values
  const currentServings = servings ? servings * multiplier : null;
  const courseTag = tags.find(t => ["breakfast", "lunch", "dinner", "snack", "dessert", "appetizers", "appetizer"].includes(t.toLowerCase())) || "Main Course";

  // Parse total time
  const parseTimeMinutes = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const prepMins = parseTimeMinutes(prepTime);
  const cookMins = parseTimeMinutes(cookingTime);
  const totalMins = prepMins + cookMins;

  // Render stars
  const displayRating = reviewCount > 0 ? avgRating : rating;
  const roundedRating = Math.round(displayRating);

  return (
    <div
      id="recipe-card"
      className="bg-[#FAF9F6] border-2 border-border p-6 md:p-10 rounded-[2.5rem] cinematic-shadow text-text space-y-8 print:border-none print:bg-white print:p-0 print:shadow-none"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-text leading-tight">
            {title}
          </h2>
          <p className="text-sm text-text-muted font-serif italic max-w-2xl leading-relaxed">
            {excerpt}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-primary text-lg font-bold">
              {"★".repeat(roundedRating) + "☆".repeat(5 - roundedRating)}
            </span>
            <span className="text-xs text-text-muted font-semibold">
              {displayRating.toFixed(1)} from {reviewCount > 0 ? reviewCount : 1} {reviewCount === 1 ? "vote" : "votes"}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="no-print flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Recipe
          </button>
        </div>

        {coverImage && (
          <div className="relative aspect-square w-full max-w-[150px] md:max-w-[180px] rounded-2xl overflow-hidden border border-border shadow-md self-start print:hidden">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 border-y border-border/80 text-sm">
        <div>
          <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Course</span>
          <span className="font-bold text-text">{courseTag.charAt(0).toUpperCase() + courseTag.slice(1)}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Prep Time</span>
          <span className="font-bold text-text">{prepTime || "—"}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Cook Time</span>
          <span className="font-bold text-text">{cookingTime || "—"}</span>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Total Time</span>
          <span className="font-bold text-text">{totalMins > 0 ? `${totalMins} mins` : "—"}</span>
        </div>
        {currentServings && (
          <div>
            <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Servings</span>
            <span className="font-bold text-text">{currentServings}</span>
          </div>
        )}
        {calories && (
          <div>
            <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Calories</span>
            <span className="font-bold text-text">{calories * multiplier} kcal</span>
          </div>
        )}
        <div>
          <span className="block text-xs uppercase tracking-wider font-bold text-text-muted/60 mb-0.5">Author</span>
          <span className="font-bold text-text">{author}</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="no-print flex flex-wrap gap-6 items-center justify-between bg-surface/50 border border-border/60 p-4 md:p-6 rounded-2xl">
        {/* Ingredient Multiplier */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Scale Ingredients</span>
          <div className="flex bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            {[1, 2, 3].map(val => (
              <button
                key={val}
                onClick={() => setMultiplier(val)}
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  multiplier === val
                    ? "bg-primary text-white"
                    : "text-text-muted hover:bg-surface"
                }`}
              >
                {val}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-center">
          {/* Unit Toggle */}
          <div className="flex bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => setUseMetric(false)}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                !useMetric
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-surface"
              }`}
            >
              US Customary
            </button>
            <button
              onClick={() => setUseMetric(true)}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                useMetric
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-surface"
              }`}
            >
              Metric
            </button>
          </div>

          {/* Cook Mode Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Cook Mode</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={cookMode}
                onChange={() => setCookMode(!cookMode)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${cookMode ? "bg-primary" : "bg-border/80"}`} />
              <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${cookMode ? "transform translate-x-5" : ""}`} />
            </div>
            <span className="text-xs text-text-muted/60 group-hover:text-text-muted transition-colors">Keep screen active</span>
          </label>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold font-serif text-text border-b border-border/60 pb-2">
          Ingredients
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {ingredients.map((item, idx) => {
            const isHeader = item.startsWith("##") || item.endsWith(":");
            if (isHeader) {
              const cleanHeader = item.replace(/^##\s*/, "").replace(/:$/, "");
              return (
                <div key={idx} className="col-span-1 md:col-span-2 mt-6 first:mt-0 mb-2 border-b border-border/40 pb-1">
                  <h4 className="text-lg font-bold font-serif italic text-primary">{cleanHeader}</h4>
                </div>
              );
            }

            // Split into metric vs customary
            const parsed = parseCustomaryAndMetric(item);
            const displayStr = useMetric ? parsed.metric : parsed.customary;
            const scaledStr = scaleQuantity(displayStr, multiplier);

            const isCompleted = !!completedIngredients[idx];

            return (
              <label
                key={idx}
                className={`flex items-start gap-3 py-2 cursor-pointer group select-none ${
                  isCompleted ? "opacity-60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleIngredient(idx)}
                  className="no-print mt-1 w-5 h-5 rounded-md border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <span
                  className={`text-sm leading-relaxed transition-all ${
                    isCompleted ? "line-through text-text-muted/50" : "text-text-muted group-hover:text-text"
                  }`}
                >
                  {scaledStr}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Instructions List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold font-serif text-text border-b border-border/60 pb-2">
          Instructions
        </h3>
        <div className="space-y-6">
          {instructions.map((step, idx) => {
            const isCompleted = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`flex gap-4 items-start select-none cursor-pointer group ${
                  isCompleted ? "opacity-65" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm border-2 transition-all ${
                    isCompleted
                      ? "bg-border border-border text-text-muted/50"
                      : "bg-primary/5 border-primary/20 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                  }`}
                >
                  {idx + 1}
                </div>
                <p
                  className={`text-sm md:text-base leading-relaxed pt-0.5 transition-all ${
                    isCompleted
                      ? "line-through text-text-muted/50"
                      : "text-text-muted group-hover:text-text"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes Box */}
      {notes && notes.length > 0 && (
        <div className="bg-surface/50 border border-border p-6 md:p-8 rounded-[2rem] space-y-4">
          <h4 className="text-lg font-bold font-serif text-primary italic">Coaching Insights & Tips</h4>
          <ul className="list-disc pl-5 space-y-2.5 text-sm text-text-muted">
            {notes.map((note, idx) => (
              <li key={idx} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nutrition Information */}
      {(calories || fat || carbs || protein) && (
        <div className="pt-6 border-t border-border/80">
          <h4 className="text-xs uppercase tracking-widest font-bold text-text-muted/60 mb-4">Nutrition Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {calories && (
              <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">{calories * multiplier}</span>
                <span className="text-xs uppercase tracking-widest font-bold text-text-muted/50">Calories</span>
              </div>
            )}
            {fat && (
              <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {scaleQuantity(fat, multiplier)}
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-text-muted/50">Fat</span>
              </div>
            )}
            {carbs && (
              <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {scaleQuantity(carbs, multiplier)}
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-text-muted/50">Carbs</span>
              </div>
            )}
            {protein && (
              <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {scaleQuantity(protein, multiplier)}
                </span>
                <span className="text-xs uppercase tracking-widest font-bold text-text-muted/50">Protein</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Callout Banner */}
      <div className="no-print bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-bold text-text font-serif italic">Tried this recipe?</h4>
          <p className="text-xs text-text-muted">
            Tag <span className="font-semibold text-primary">@stewartlucas</span> on Instagram and hashtag it <span className="font-semibold text-primary">#nutriguide</span>!
          </p>
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
