"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, FileText, CheckCircle2, RefreshCw, ArrowLeft, ArrowRight, Eye, Calendar, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PinData {
  id: string;
  title: string;
  description: string;
  boardName: string;
  imageUrl: string;
  textOverlay: string;
  overlayPosition: string;
  overlayStyle: string;
  isNew: boolean;
  content: {
    id: string;
    title: string;
    body: string;
    published: boolean;
  } | null;
}

interface Props {
  initialPins: PinData[];
}

export function PinterestApproveClient({ initialPins }: Props) {
  const router = useRouter();
  const [pins, setPins] = useState<PinData[]>(initialPins);
  const [previewContent, setPreviewContent] = useState<{ title: string; body: string } | null>(null);
  
  // Scheduling Actions States
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scheduleDetails, setScheduleDetails] = useState<{ count: number; t1: string; t2: string } | null>(null);

  const handleApproveAll = async () => {
    if (!confirm("Confirm Approval: This will publish the new blog posts live and schedule all pins for their peak traffic hours?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/pinterest/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScheduleDetails({
          count: data.scheduledCount,
          t1: data.time1,
          t2: data.time2
        });
        setIsSuccess(true);
      } else {
        alert(`Error: ${data.error || "Failed to schedule pins"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error scheduling pins.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h3 className="font-bold text-gray-900">Approve and Schedule Release</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            Review the generated Pin graphics and write-ups below. approving them launches the scheduler.
          </p>
        </div>
        <button
          onClick={handleApproveAll}
          disabled={pins.length === 0 || loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e60023] hover:bg-[#b80018] disabled:opacity-40 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Publish Posts & Schedule Queue
        </button>
      </div>

      {pins.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <Pin className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <h3 className="text-lg font-bold text-gray-700">No Draft Pins Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
            There are no pins awaiting approval. First generate some ideas, approve them, and let Gemini render the visual Pin drafts.
          </p>
          <button
            onClick={() => router.push("/admin/pinterest")}
            className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pins.map((pin) => (
            <div 
              key={pin.id} 
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                pin.isNew ? "border-emerald-200 bg-emerald-50/5" : "border-blue-200 bg-blue-50/5"
              }`}
            >
              {/* Header Badge */}
              <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between ${
                pin.isNew ? "bg-emerald-500/10 text-emerald-800" : "bg-blue-500/10 text-blue-800"
              }`}>
                <span>{pin.isNew ? "Fresh AI Content (New Recipe)" : "Evergreen Mixer (Existing Recipe)"}</span>
                <span className="font-mono text-[10px]">Board: {pin.boardName}</span>
              </div>

              {/* Pin Presentation */}
              <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                {/* Image Graphic with Overlay */}
                <div className="w-full sm:w-44 shrink-0 flex flex-col gap-2">
                  <div className="relative aspect-[2/3] bg-slate-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img 
                      src={pin.imageUrl} 
                      alt={pin.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-center text-slate-400 italic">
                    Text Overlay: "{pin.textOverlay}" ({pin.overlayStyle} / {pin.overlayPosition})
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight font-serif">{pin.title}</h4>
                    <p className="text-gray-600 text-xs mt-2 leading-relaxed">{pin.description}</p>
                  </div>

                  {pin.content && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                      <div className="truncate pr-4">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Linked Article</span>
                        <span className="text-xs text-slate-700 font-medium truncate block">{pin.content.title}</span>
                      </div>
                      
                      <button
                        onClick={() => setPreviewContent({ title: pin.content!.title, body: pin.content!.body })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded transition-colors shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-gray-900 text-xl font-serif">{previewContent.title}</h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 prose prose-sm max-w-none prose-emerald">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewContent.body}
              </ReactMarkdown>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setPreviewContent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && scheduleDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800">Queue Active!</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Successfully published new draft blog articles and scheduled <strong>{scheduleDetails.count} Pins</strong> for maximum Pinterest engagement.
              </p>
            </div>

            {/* Scheduled dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Slot 1: {new Date(scheduleDetails.t1).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Slot 2: {new Date(scheduleDetails.t2).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                router.push("/admin/pinterest");
                router.refresh();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow"
            >
              Return to Pinterest command Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
