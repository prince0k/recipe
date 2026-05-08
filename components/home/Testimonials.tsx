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

  return (
    <section className="py-24 bg-surface rounded-[4rem] mx-4 lg:mx-8 mb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mt-48" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-bold text-text">What Our Community Says</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] cinematic-shadow border border-border">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} className={`w-4 h-4 ${s <= item.rating ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
              <p className="text-text-muted mb-8 leading-relaxed italic font-serif">
                "{item.comment}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                  {item.user.image ? (
                    <img src={item.user.image} alt={item.user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-secondary font-bold">{item.user.name?.[0] || "?"}</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-text">{item.user.name || "Happy Cook"}</div>
                  <div className="text-xs text-text-muted uppercase tracking-widest font-bold">Verified User</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
