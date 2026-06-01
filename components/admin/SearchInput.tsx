"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(currentSearch);

  // Keep internal state in sync with URL search params changes (e.g. if cleared from elsewhere)
  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (value !== currentSearch) {
        handleSearch(value);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset page on new search
    
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/admin/content?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setValue("");
    handleSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
        ) : (
          <Search className="h-4 w-4 text-slate-400" />
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search title, slug, excerpt..."
        className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm placeholder-slate-400 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all duration-200 shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
