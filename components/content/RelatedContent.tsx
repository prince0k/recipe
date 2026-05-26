"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function RelatedContent({ items, title = "You Might Also Like" }: { items: any[], title?: string }) {
  if (!items || items.length === 0) return null;

  // Take top 3 items for a balanced layout
  const displayItems = items.slice(0, 3);

  const getHref = (item: any) => {
    if (item.type === "RECIPE") return `/recipes/${item.slug}`;
    if (item.type === "CHEAT_SHEET") return `/cheat-sheets/${item.slug}`;
    return `/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`;
  };

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h3 className="text-2xl font-bold text-text mb-6 font-serif italic">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {displayItems.map((r) => {
          const href = getHref(r);
          return (
            <Link
              key={r.slug}
              href={href}
              className="group rounded-[2rem] overflow-hidden border border-border bg-white hover:cinematic-shadow transition-all duration-300 flex flex-col"
            >
              {r.coverImage && (
                <div className="relative h-36 w-full overflow-hidden">
                  <Image 
                    src={r.coverImage} 
                    alt={r.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized={r.coverImage?.startsWith('/uploads')}
                  />
                </div>
              )}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[8px] md:text-[9px] uppercase font-extrabold tracking-widest text-primary block mb-1">
                    {r.type.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {r.title}
                  </p>
                </div>
                {r.cookingTime && (
                  <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {r.cookingTime}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
