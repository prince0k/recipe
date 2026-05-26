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
  }, []);

  if (isLoading || testimonials.length === 0) return null;

  // Split testimonials into 2 rows for a premium double-scrolling marquee effect
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  return (
    <section className="py-24 bg-surface rounded-[4rem] mx-4 lg:mx-8 mb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -mr-48 -mb-48" />
      
      <div className="relative z-10">
        <div className="text-center mb-16 px-4">
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-text">What Our Community Says</h2>
        </div>

        <div className="space-y-8 max-w-full overflow-hidden">
          {/* Row 1: Scrolling Left */}
          <div className="relative flex overflow-x-hidden w-full">
            <div className="animate-marquee flex gap-8 whitespace-nowrap py-4 pr-8">
              {row1.map((item) => (
                <TestimonialCard key={`row1-${item.id}`} item={item} />
              ))}
              {row1.map((item) => (
                <TestimonialCard key={`row1-dup-${item.id}`} item={item} />
              ))}
            </div>
            {/* Soft gradient fade overlays on edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface via-surface/60 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface via-surface/60 to-transparent pointer-events-none z-10" />
          </div>

          {/* Row 2: Scrolling Right */}
          {row2.length > 0 && (
            <div className="relative flex overflow-x-hidden w-full">
              <div className="animate-marquee-reverse flex gap-8 whitespace-nowrap py-4 pr-8">
                {row2.map((item) => (
                  <TestimonialCard key={`row2-${item.id}`} item={item} />
                ))}
                {row2.map((item) => (
                  <TestimonialCard key={`row2-dup-${item.id}`} item={item} />
                ))}
              </div>
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface via-surface/60 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface via-surface/60 to-transparent pointer-events-none z-10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: Review }) {
  return (
    <div className="w-[320px] md:w-[400px] shrink-0 bg-white p-8 rounded-[2.5rem] cinematic-shadow border border-border flex flex-col justify-between whitespace-normal">
      <div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} className={`w-4 h-4 ${s <= item.rating ? "fill-accent text-accent" : "text-border"}`} />
          ))}
        </div>
        <p className="text-text-muted mb-6 leading-relaxed italic font-serif text-sm md:text-base">
          "{item.comment}"
        </p>
      </div>
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
          {item.user.image ? (
            <img src={item.user.image} alt={item.user.name || ""} className="w-full h-full object-cover" />
          ) : (
            <span className="text-secondary font-bold text-sm">{item.user.name?.[0] || "?"}</span>
          )}
        </div>
        <div>
          <div className="font-bold text-text text-sm">{item.user.name || "Happy Cook"}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Verified User</div>
        </div>
      </div>
    </div>
  );
}

