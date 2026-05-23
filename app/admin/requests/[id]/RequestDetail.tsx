"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, User, Mail, FileText, ClipboardList, Sparkles, Send, Copy, Check } from "lucide-react";

interface RequestDetailProps {
  id: string;
  request: any;
}

export function RequestDetail({ id, request }: RequestDetailProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMarkAsSent = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}/send`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Marked as SENT! (Email sending is currently skipped per your request)");
        router.push("/admin/requests");
        router.refresh();
      } else {
        alert("Failed to mark as sent.");
      }
    } catch (e) {
      alert("Error.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(request.generatedContent || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let answers = {};
  try { answers = JSON.parse(request.answers); } catch (e) {}

  const userInitials = request.user.name 
    ? request.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() 
    : request.user.email.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/admin/requests" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all duration-200 group bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              Back to Requests
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
              Request Review
            </h1>
            {request.status === "SENT" ? (
              <Badge variant="success" className="font-bold border border-green-200/50">
                SENT &amp; DELIVERED
              </Badge>
            ) : (
              <Badge variant="warning" className="font-bold border border-yellow-200/50">
                PENDING REVIEW
              </Badge>
            )}
          </div>
        </div>

        {request.status === "PENDING" && (
          <Button 
            onClick={handleMarkAsSent} 
            isLoading={isSending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all duration-200 active:scale-98"
          >
            <Send className="w-4 h-4" />
            Mark as Sent (Skip Email)
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar panels */}
        <div className="col-span-1 space-y-8">
          
          {/* Card 1: User Profile */}
          <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-bold text-slate-900 font-serif text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                User Profile
              </h3>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-base border border-emerald-500/20 shadow-inner">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {request.user.name || "Anonymous User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {request.user.email}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Requested Guide</span>
                  <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1 mt-1 font-serif">
                    <FileText className="w-4 h-4" />
                    {request.content.title}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Questionnaire Answers */}
          <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-bold text-slate-900 font-serif text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                Survey Responses
              </h3>
            </div>
            <CardContent className="p-6 divide-y divide-slate-100">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="py-3 first:pt-0 last:pb-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 leading-relaxed block">
                    {value as string}
                  </span>
                </div>
              ))}
              {Object.keys(answers).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 italic">No survey answers found.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Document panel */}
        <div className="col-span-2">
          <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-bold text-slate-900 font-serif text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Generated Guide
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {request.generatedContent && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/50"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy text
                      </>
                    )}
                  </button>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-200/40">
                  GPT-4o-mini
                </span>
              </div>
            </div>
            
            <CardContent className="p-6 flex-1 bg-slate-50/50">
              <div className="bg-white text-[#2d2a26] p-8 md:p-14 rounded-2xl border border-slate-200/60 shadow-inner overflow-y-auto max-h-[750px] scrollbar-thin">
                <div className="prose prose-stone prose-emerald max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4
                  prose-p:leading-[1.8] prose-p:text-slate-650 prose-p:mb-6
                  prose-strong:text-slate-900 prose-strong:font-bold
                  prose-li:my-2 prose-li:text-slate-650
                  prose-hr:border-slate-150 prose-hr:my-10">
                  {request.generatedContent ? (
                    <ReactMarkdown>{request.generatedContent}</ReactMarkdown>
                  ) : (
                    <div className="text-slate-400 italic text-center py-12">
                      No content generated yet.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
