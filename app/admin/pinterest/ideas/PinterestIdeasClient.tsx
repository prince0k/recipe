"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Check, X, RefreshCw, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  concept: string;
  type: string;
  status: string;
  createdAt: Date;
}

interface Props {
  initialIdeas: Idea[];
}

export function PinterestIdeasClient({ initialIdeas }: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Generation Process States
  const [processing, setProcessing] = useState(false);
  const [currentProcessingTitle, setCurrentProcessingTitle] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === ideas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ideas.map(i => i.id)));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this idea? It will be archived.")) return;
    
    try {
      const res = await fetch("/api/admin/pinterest/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: id, action: "reject" })
      });
      if (res.ok) {
        setIdeas(ideas.filter(i => i.id !== id));
        const nextSelected = new Set(selectedIds);
        nextSelected.delete(id);
        setSelectedIds(nextSelected);
      } else {
        alert("Failed to reject idea");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting API");
    }
  };

  const handleApproveAndGenerate = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one idea to approve.");
      return;
    }

    setProcessing(true);
    setProcessedCount(0);
    setIsFinished(false);
    
    const idsToProcess = Array.from(selectedIds);
    
    for (let i = 0; i < idsToProcess.length; i++) {
      const id = idsToProcess[i];
      const ideaObj = ideas.find(item => item.id === id);
      if (!ideaObj) continue;

      setCurrentProcessingTitle(ideaObj.title);
      setStatusText(`1. Approving idea...`);
      
      try {
        // Step A: Mark as approved in DB
        const approveRes = await fetch("/api/admin/pinterest/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideaId: id, action: "approve" })
        });
        
        if (!approveRes.ok) {
          throw new Error("Failed to approve idea");
        }

        setStatusText(`2. Generating blog post draft and visual Pin via Gemini...`);
        
        // Step B: Generate content & Pins (this generates draft recipe + sharp overlays + old pin)
        const genRes = await fetch("/api/admin/pinterest/ideas/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideaId: id }),
        });

        if (!genRes.ok) {
          const data = await genRes.json();
          throw new Error(data.error || "Generation API error");
        }

        setProcessedCount(prev => prev + 1);
      } catch (err: any) {
        console.error(err);
        alert(`❌ Failed to process "${ideaObj.title}": ${err.message}`);
        setProcessing(false);
        return;
      }
    }

    // Done with all
    setStatusText("🎉 All approved ideas successfully processed! Draft recipes are created, visual Pins are rendered, and notifications have been dispatched.");
    setIsFinished(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            {selectedIds.size === ideas.length ? "Deselect All" : "Select All"}
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {selectedIds.size} of {ideas.length} selected
          </span>
        </div>
        
        <button
          onClick={handleApproveAndGenerate}
          disabled={selectedIds.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
        >
          <Brain className="w-4 h-4" />
          Approve & Generate Content ({selectedIds.size})
        </button>
      </div>

      {ideas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <Brain className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <h3 className="text-lg font-bold text-gray-700">No Pending Ideas</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            There are no ideas waiting for review. Go back to the dashboard and trigger Gemini to brainstorm new ones!
          </p>
          <button
            onClick={() => router.push("/admin/pinterest")}
            className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ideas.map((idea) => {
            const isChecked = selectedIds.has(idea.id);
            return (
              <div 
                key={idea.id}
                onClick={() => toggleSelect(idea.id)}
                className={`p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-4 ${
                  isChecked ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/30" : "border-gray-200"
                }`}
              >
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // toggled by parent click
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        idea.type === "RECIPE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        idea.type === "BLOG" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        idea.type === "DIET_PLAN" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {idea.type ? idea.type.toUpperCase().replace("_", " ") : "RECIPE"}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight font-serif">
                        {idea.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                      PENDING
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {idea.concept}
                  </p>
                  <div className="text-[10px] text-gray-400 mt-4 font-mono">
                    Brainstormed on: {new Date(idea.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleReject(idea.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Reject Idea"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Processing Modal Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Processing Approved Ideas</h3>
              <p className="text-slate-500 text-sm">
                Gemini is busy generating articles and designing Pinterest graphics. Please don't close this window.
              </p>
            </div>

            {/* Individual Item Progress */}
            {!isFinished && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
                  <span>Current Task</span>
                  <span>{processedCount} of {selectedIds.size} done</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm truncate">
                  "{currentProcessingTitle}"
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                  {statusText}
                </p>
              </div>
            )}

            {/* Overall Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Overall Progress</span>
                <span>{Math.round((processedCount / selectedIds.size) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(processedCount / selectedIds.size) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Completion View */}
            {isFinished && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-800 text-sm leading-relaxed animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>{statusText}</p>
              </div>
            )}

            {/* Footer buttons inside modal */}
            <div className="flex justify-end pt-2">
              {isFinished ? (
                <button
                  onClick={() => {
                    setProcessing(false);
                    router.push("/admin/pinterest/approve-pin");
                    router.refresh();
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Go to Pin Approval <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Processing details in background...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
