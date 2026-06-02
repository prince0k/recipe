"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/reviews?approvedOnly=true");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();

    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || testimonials.length === 0) return null;

  // Limit to top 8 testimonials for a clean, non-cluttered slider UI
  const sliderItems = testimonials.slice(0, 8);
  const totalItems = sliderItems.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const isMobile = windowWidth !== null && windowWidth < 768;
  const step = isMobile ? 180 : 320;

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-surface rounded-2xl sm:rounded-[2.5rem] md:rounded-[4rem] mx-2 sm:mx-4 lg:mx-8 mb-12 sm:mb-16 md:mb-24 relative overflow-hidden select-none">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -mr-48 -mb-48 pointer-events-none" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <span className="text-primary font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-2 sm:mb-4 block">Success Stories</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text">What Our Community Says</h2>
        </div>

        {/* 3D Cover Flow Slider Viewport */}
        <div className="relative w-full max-w-5xl h-[280px] sm:h-[340px] md:h-[400px] flex items-center justify-center">
          
          {/* Left Arrow Button */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-8 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-white border border-border shadow-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300 text-text cursor-pointer"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slider Cards Wrapper */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {sliderItems.map((item, index) => {
              const offset = index - activeIndex;
              const isCenter = index === activeIndex;
              
              // Handle wrapping for correct circular list indexing
              let position = offset;
              if (offset < -1 && activeIndex >= totalItems - 2) {
                position = offset + totalItems;
              } else if (offset > 1 && activeIndex <= 1) {
                position = offset - totalItems;
              }

              const isVisible = Math.abs(position) <= 2;
              if (!isVisible) return null;

              // 3D cover flow parameters
              const translateVal = position * step;
              const scaleVal = isCenter ? 1.1 : 0.82;
              const zIndexVal = 30 - Math.abs(position) * 10;
              const opacityVal = isCenter ? 1 : 0.45;
              const blurVal = isCenter ? 0 : 3;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className="absolute transition-all duration-500 ease-out select-none cursor-pointer flex flex-col justify-between"
                  style={{
                    transform: `translateX(${translateVal}px) scale(${scaleVal})`,
                    zIndex: zIndexVal,
                    opacity: opacityVal,
                    filter: `blur(${blurVal}px)`,
                    width: isMobile ? '260px' : '420px',
                  }}
                >
                  <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] cinematic-shadow border border-border flex flex-col justify-between h-[220px] sm:h-[260px] md:h-[320px] text-left">
                    <div>
                      {/* Stars Rating */}
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon 
                            key={s} 
                            className={`w-4 h-4 ${s <= item.rating ? "fill-accent text-accent" : "text-border"}`} 
                          />
                        ))}
                      </div>
                      
                      {/* Review Comment */}
                      <p className="text-text-muted mb-4 sm:mb-6 leading-relaxed italic font-serif text-[11px] sm:text-xs md:text-base line-clamp-3 sm:line-clamp-4 md:line-clamp-5">
                        "{item.comment}"
                      </p>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.user.image ? (
                          <img 
                            src={item.user.image} 
                            alt={item.user.name || ""} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-secondary font-bold text-sm">
                            {item.user.name?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-text text-xs md:text-sm">
                          {item.user.name || "Happy Cook"}
                        </div>
                        <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">
                          Verified User
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-8 z-40 h-12 w-12 flex items-center justify-center rounded-full bg-white border border-border shadow-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300 text-text cursor-pointer"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6 z-40">
          {sliderItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 border border-border/80 cursor-pointer ${
                index === activeIndex ? "bg-text w-6" : "bg-border/60 w-2.5 hover:bg-text-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


