"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function RelatedContent({ items, title = "You Might Also Like" }: { items: any[], title?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!items || items.length === 0) return null;

  const carouselItems = items.slice(0, 5);
  const totalItems = carouselItems.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const isMobile = windowWidth !== null && windowWidth < 768;
  const step = isMobile ? 110 : 210;

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-2xl font-bold text-text border-b border-border pb-3">
        {title}
      </h3>
      
      {/* Cover Flow Carousel Container */}
      <div className="relative w-full flex flex-col items-center py-6 overflow-hidden select-none">
        {/* Carousel Viewport */}
        <div className="relative w-full max-w-4xl h-[330px] md:h-[380px] flex items-center justify-center">
          
          {/* Left Arrow */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 md:left-4 z-40 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 border border-border shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 text-text cursor-pointer"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slider Content Wrapper */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {carouselItems.map((item, index) => {
              const offset = index - activeIndex;
              const isCenter = index === activeIndex;
              
              // Handle wrapping for correct neighbor indexing in circular list
              let position = offset;
              if (offset < -1 && activeIndex >= totalItems - 2) {
                // If index is far left but active index is near the end, wrap to right
                position = offset + totalItems;
              } else if (offset > 1 && activeIndex <= 1) {
                // If index is far right but active index is near the start, wrap to left
                position = offset - totalItems;
              }

              const isVisible = Math.abs(position) <= 2;
              if (!isVisible) return null;

              // Calculate style parameters
              const translateVal = position * step;
              const scaleVal = isCenter ? 1.12 : 0.85;
              const zIndexVal = 30 - Math.abs(position) * 10;
              const opacityVal = isCenter ? 1 : 0.55;
              const blurVal = isCenter ? 0 : 2;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className="absolute transition-all duration-500 ease-out select-none cursor-pointer flex flex-col items-center"
                  style={{
                    transform: `translateX(${translateVal}px) scale(${scaleVal})`,
                    zIndex: zIndexVal,
                    opacity: opacityVal,
                    filter: `blur(${blurVal}px)`,
                    width: isMobile ? '160px' : '200px',
                  }}
                >
                  <div className="w-full rounded-2xl border border-border bg-surface overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    {/* Card Cover Image */}
                    <div className="relative aspect-[3/2] overflow-hidden bg-muted flex-shrink-0">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 160px, 200px"
                          className="object-cover pointer-events-none"
                          unoptimized={item.coverImage?.startsWith('/uploads')}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Cover Label */}
                    <div className="p-3 md:p-4 bg-surface text-left">
                      <span className="text-[8px] md:text-[9px] uppercase font-extrabold tracking-widest text-primary block mb-1">
                        {item.type.replace('_', ' ')}
                      </span>
                      <h4 className="font-serif text-[10px] md:text-sm font-bold text-text line-clamp-2 md:line-clamp-3 leading-snug">
                        {item.title}
                      </h4>
                      
                      {/* View Button for Center Item */}
                      <div className={`mt-2.5 pt-2.5 border-t border-border/20 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
                        <Link 
                          href={
                            item.type === "RECIPE" ? `/recipes/${item.slug}` :
                            item.type === "CHEAT_SHEET" ? `/cheat-sheets/${item.slug}` :
                            `/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`
                          }
                          className="inline-block text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={nextSlide}
            className="absolute right-0 md:right-4 z-40 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 border border-border shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 text-text cursor-pointer"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators Dots */}
        <div className="flex justify-center gap-2 mt-4 z-40">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 border border-border/80 cursor-pointer ${
                index === activeIndex ? "bg-text w-6" : "bg-border/60 hover:bg-text-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
