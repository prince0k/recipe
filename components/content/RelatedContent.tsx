import React from "react";
import Link from "next/link";
import Image from "next/image";

export function RelatedContent({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-2xl font-bold text-text border-b border-border pb-3">
        Explore More
      </h3>
      
      {/* Bookshelf Container */}
      <div className="bookshelf-container relative pt-10 pb-6 overflow-hidden">
        {/* Books Flex Container (Overlapping Books) */}
        <div className="bookshelf-flex">
          {items.slice(0, 4).map((item) => (
            <Link 
              key={item.id} 
              href={
                item.type === "RECIPE" ? `/recipes/${item.slug}` :
                item.type === "CHEAT_SHEET" ? `/cheat-sheets/${item.slug}` :
                `/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`
              }
              className="book-card group relative flex flex-col justify-between overflow-hidden bg-surface border border-border"
            >
              {/* Book Spine Crease Effect */}
              <div className="book-spine-crease" />
              
              {/* Book Cover Content */}
              <div className="flex flex-col h-full">
                {/* Book Cover Image */}
                <div className="relative aspect-[3/2] overflow-hidden bg-muted flex-shrink-0">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 110px, 170px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized={item.coverImage?.startsWith('/uploads')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-primary">
                        {item.type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Book Cover Label */}
                <div className="p-2 md:p-4 flex-grow flex flex-col justify-between bg-surface select-none">
                  <div>
                    <span className="text-[8px] md:text-[9px] uppercase font-extrabold tracking-widest text-primary block mb-1">
                      {item.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-serif text-[10px] md:text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-3 leading-tight md:leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  
                  {/* Read indicator */}
                  <div className="hidden md:flex justify-end items-center mt-2 pt-2 border-t border-border/20">
                    <span className="text-[9px] font-sans text-text-muted italic opacity-60">read guide →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Wooden Shelf Bar */}
        <div className="bookshelf-shelf" />
      </div>
    </div>
  );
}
