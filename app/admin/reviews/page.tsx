"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Star, CheckCircle, XCircle, Trash2, ArrowLeft, MessageSquare, ShieldCheck, StarHalf, Loader2 } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  content: {
    title: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
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

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: !currentStatus } : r));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  // Compute Metrics from state
  const totalCount = reviews.length;
  const approvedCount = reviews.filter(r => r.isApproved).length;
  const averageRating = totalCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1) 
    : "0.0";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all duration-200 group bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            Reviews Moderation
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage feedback submissions, approve testimonials to showcase on public recipes pages, and filter spam.
          </p>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reviews</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Rating</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-slate-900">{averageRating}</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-md">
                  ★ out of 5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved / Public</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{approvedCount.toLocaleString()}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                  {totalCount > 0 ? `${Math.round((approvedCount / totalCount) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-100 overflow-hidden shadow-sm bg-white">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-850 font-serif text-lg">Reviews Feed</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approve testimonials or delete outdated feedback</p>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Recipe/Guide</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating &amp; Comment</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-550">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                        <span>Loading user reviews...</span>
                      </div>
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-450 text-sm">
                      No reviews found in the database.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => {
                    const initials = review.user.name 
                      ? review.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() 
                      : review.user.email.slice(0, 2).toUpperCase();
                    return (
                      <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-250/60 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {review.user.name || "Anonymous User"}
                              </div>
                              <div className="text-xs text-slate-550 truncate">
                                {review.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-slate-800 font-serif max-w-[200px] truncate">
                            {review.content.title}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-sm">
                          <div className="flex gap-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed break-words line-clamp-3">
                            "{review.comment}"
                          </p>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {review.isApproved ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-green-50 text-green-700 rounded-full flex items-center gap-1 border border-green-200/50 w-fit">
                              <CheckCircle className="w-3.5 h-3.5 text-green-650" /> Approved
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full flex items-center gap-1 border border-slate-200/50 w-fit">
                              <XCircle className="w-3.5 h-3.5 text-slate-400" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleApproval(review.id, review.isApproved)}
                              className={`font-semibold text-xs rounded-lg px-3 h-8 shadow-sm transition-colors border ${
                                review.isApproved 
                                  ? "text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/80 border-amber-200/50" 
                                  : "text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border-emerald-250/30"
                              }`}
                            >
                              {review.isApproved ? "Unapprove" : "Approve"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(review.id)}
                              className="text-red-500 hover:text-red-750 hover:bg-red-50/60 transition-colors border border-transparent rounded-lg h-8 px-2.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
