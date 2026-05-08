"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { StarIcon } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export function Reviews({ contentId }: { contentId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [contentId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?contentId=${contentId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, rating, comment }),
      });

      if (res.ok) {
        setComment("");
        setRating(5);
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-t border-border pt-12">
        <h2 className="text-3xl font-bold text-text mb-8 font-serif">Community Reviews</h2>
        
        {session ? (
          <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-3xl border border-border shadow-sm mb-12">
            <h3 className="text-xl font-bold text-text mb-4">Leave a Review</h3>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <StarIcon
                    className={`w-8 h-8 transition-colors ${
                      star <= rating ? "fill-accent text-accent" : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this recipe..."
              className="w-full p-4 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none min-h-[120px] mb-6"
              required
            />
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8">
              {isSubmitting ? "Submitting..." : "Post Review"}
            </Button>
          </form>
        ) : (
          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 text-center mb-12">
            <p className="text-text-muted mb-4">Please log in to leave a review.</p>
            <Button variant="outline" onClick={() => window.location.href = "/login"}>Log In</Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                  {review.user.image ? (
                    <img src={review.user.image} alt={review.user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-secondary font-bold">{review.user.name?.[0] || "?"}</span>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-text">{review.user.name || "Anonymous"}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "fill-accent text-accent" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-text-muted leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted italic text-center py-8">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  );
}
