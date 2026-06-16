"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Brain, FileText, CheckCircle, RefreshCw } from "lucide-react";

interface Props {
  pendingIdeasCount: number;
  draftPinsCount: number;
}

export function PinterestDashboardClient({ pendingIdeasCount, draftPinsCount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBrainstorm = async () => {
    setLoading(true);
    setMessage("Gemini is checking existing posts and brainstorming 5 new unique concepts...");
    try {
      const res = await fetch("/api/admin/pinterest/ideas/generate-ideas", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("🎉 5 new unique ideas successfully generated! Sending email alert...");
        setTimeout(() => {
          router.push("/admin/pinterest/ideas");
          router.refresh();
        }, 1500);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to generate ideas"}`);
      }
    } catch (err) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingIdeasCount > 0 && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4 shadow-sm animate-pulse-subtle">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 text-lg">Ideas Awaiting Review</h3>
              <p className="text-amber-700 text-sm mt-1">
                You have <strong>{pendingIdeasCount}</strong> brainstormed ideas waiting for your approval.
              </p>
              <button
                onClick={() => router.push("/admin/pinterest/ideas")}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Review Ideas &rarr;
              </button>
            </div>
          </div>
        )}

        {draftPinsCount > 0 && (
          <div className="p-6 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-[#10b981]/20 text-[#10b981] rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0f5132] text-lg">Draft Pins Ready</h3>
              <p className="text-[#0f5132] text-sm mt-1">
                You have <strong>{draftPinsCount}</strong> generated post & pin drafts ready to review.
              </p>
              <button
                onClick={() => router.push("/admin/pinterest/approve-pin")}
                className="mt-4 px-4 py-2 bg-[#10b981] hover:bg-[#0891b2] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Approve & Schedule Pins &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Bar */}
      <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-serif text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Brainstorm Hub
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            Click to activate the Gemini brainstorming agent. It will analyze your existing published content, design 5 unique and new recipe or blog post topics, and save them in the queue for your approval.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-stretch md:items-end gap-3 min-w-[200px]">
          <button
            onClick={handleBrainstorm}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
            Brainstorm 5 Ideas
          </button>
        </div>
      </div>

      {/* Status Alert Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Gemini is Thinking...</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-1/2 rounded-full animate-loader"></div>
            </div>
          </div>
        </div>
      )}

      {/* Message Banner for status updates */}
      {!loading && message && (
        <div className={`p-4 rounded-xl text-center font-medium ${
          message.startsWith("❌") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
