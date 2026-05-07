"use client";

import React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, baseUrl, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (!baseUrl) return "#";
    const url = new URL(baseUrl, "http://localhost"); // Dummy base for URL parsing
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  const renderPageButton = (page: number) => {
    const isActive = page === currentPage;
    const baseClasses = "w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300";
    const activeClasses = "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10";
    const inactiveClasses = "bg-surface border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5";

    if (onPageChange) {
      return (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
          {page}
        </button>
      );
    }

    return (
      <Link
        key={page}
        href={getPageUrl(page)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        {page}
      </Link>
    );
  };

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(renderPageButton(i));
  }

  const ArrowButton = ({ direction, disabled }: { direction: "prev" | "next", disabled: boolean }) => {
    const isPrev = direction === "prev";
    const targetPage = isPrev ? currentPage - 1 : currentPage + 1;
    
    const baseClasses = "w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-surface transition-all duration-300";
    const enabledClasses = "text-text hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer";
    const disabledClasses = "text-gray-300 cursor-not-allowed opacity-50";

    const Icon = () => (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {isPrev ? (
          <polyline points="15 18 9 12 15 6"></polyline>
        ) : (
          <polyline points="9 18 15 12 9 6"></polyline>
        )}
      </svg>
    );

    if (disabled) {
      return (
        <div className={`${baseClasses} ${disabledClasses}`}>
          <Icon />
        </div>
      );
    }

    if (onPageChange) {
      return (
        <button
          onClick={() => onPageChange(targetPage)}
          className={`${baseClasses} ${enabledClasses}`}
        >
          <Icon />
        </button>
      );
    }

    return (
      <Link
        href={getPageUrl(targetPage)}
        className={`${baseClasses} ${enabledClasses}`}
      >
        <Icon />
      </Link>
    );
  };


  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <ArrowButton direction="prev" disabled={currentPage <= 1} />
      
      <div className="flex items-center gap-2">
        {startPage > 1 && (
          <>
            {renderPageButton(1)}
            {startPage > 2 && <span className="text-border px-1">...</span>}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-border px-1">...</span>}
            {renderPageButton(totalPages)}
          </>
        )}
      </div>

      <ArrowButton direction="next" disabled={currentPage >= totalPages} />
    </div>
  );
}
