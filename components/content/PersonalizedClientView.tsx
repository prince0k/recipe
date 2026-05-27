"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StarIcon } from "lucide-react";
import { PersonalizedActions } from "./PersonalizedActions";

interface Review {
  rating: number;
}

interface User {
  name: string | null;
  role: string;
}

interface Content {
  title: string;
}

interface PersonalizedRequest {
  id: string;
  createdAt: string | Date;
  generatedContent: string | null;
  content: Content;
  user: User;
}

interface PersonalizedClientViewProps {
  request: any;
}

const customMarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="font-serif italic text-3xl md:text-4xl mb-6 text-text font-bold" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="font-serif italic text-2xl md:text-3xl mt-10 mb-5 text-text font-bold" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="font-serif italic text-xl md:text-2xl mt-8 mb-4 text-primary font-bold" {...props} />,
  p: ({ node, ...props }: any) => <p className="leading-relaxed text-gray-750 text-sm md:text-base mb-6" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="space-y-3 mb-6 pl-4" {...props} />,
  li: ({ node, ...props }: any) => (
    <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base mb-2">
      <span className="text-primary mt-1.5 flex-shrink-0 font-bold">•</span>
      <span {...props} />
    </li>
  ),
  // Premium Table Renderers
  table: ({ node, ...props }: any) => (
    <div className="prose-table-wrapper border border-border rounded-2xl overflow-hidden my-8 shadow-sm">
      <table className="min-w-full divide-y divide-border bg-white text-sm" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => <thead className="bg-text text-white" {...props} />,
  tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-border" {...props} />,
  tr: ({ node, ...props }: any) => <tr className="hover:bg-gray-50/50 transition-colors" {...props} />,
  th: ({ node, ...props }: any) => (
    <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-white" style={{ color: '#fff' }} {...props} />
  ),
  td: ({ node, ...props }: any) => <td className="px-6 py-4 text-text-muted text-xs md:text-sm font-sans" {...props} />
};

export function PersonalizedClientView({ request }: PersonalizedClientViewProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Parse markdown into distinct pages based on the 8 main uppercase headings
  const rawSections = (request.generatedContent || "").split(/(?=^(?:###|##|#)?\s*(?:\*\*|__)?(?:(?:1\.\s+)?LETTER FROM STEWART LUCAS|(?:1\.\s+)?PERSONAL OPENING LETTER|\d+[\.:]\s*(?:\*\*|__)?[^a-z\n]+)(?:\*\*|__)?\s*$)/m);
  
  let intro = "";
  let sections: { title: string; content: string }[] = [];

  rawSections.forEach((sec: string) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    // Get the first line of the section to verify if it is a main heading
    const firstLine = trimmed.split("\n")[0].trim();
    const match = firstLine.match(/^(?:###|##|#)?\s*(?:\*\*|__)?(?:(\d+)[\.:]\s*(?:\*\*|__)?)?([^a-z]+)(?:\*\*|__)?$/);

    if (match && (match[1] || match[2].includes("LETTER FROM STEWART") || match[2].includes("PERSONAL OPENING"))) {
      const num = match[1] ? parseInt(match[1]) : 1;
      let cleanTitle = match[2].replace(/\*|_/g, "").trim();
      if (cleanTitle.toUpperCase().includes("PERSONAL OPENING LETTER") || cleanTitle.toUpperCase().includes("OPENING LETTER")) {
        cleanTitle = "LETTER FROM STEWART LUCAS";
      }
      sections.push({
        title: cleanTitle || `Page ${num}`,
        content: trimmed
      });
    } else {
      // If it doesn't match a main section header, it's intro text
      if (sections.length > 0) {
        sections[sections.length - 1].content += "\n\n" + trimmed;
      } else {
        intro = trimmed;
      }
    }
  });

  // Prepend intro text to the first section
  if (intro && sections.length > 0) {
    sections[0].content = intro + "\n\n" + sections[0].content;
  }

  // Fallback if split failed
  if (sections.length === 0) {
    sections = [{ title: "Personalized Plan", content: request.generatedContent || "" }];
  }

  const renderSectionContent = (sec: { title: string; content: string }, idx: number) => {
    const isOpeningLetter = sec.title.toUpperCase().includes("LETTER FROM STEWART LUCAS") || 
                           sec.title.toUpperCase().includes("PERSONAL OPENING LETTER");

    if (isOpeningLetter) {
      // Extract body content by skipping the first line (header)
      const contentLines = sec.content.split("\n");
      const bodyContent = contentLines.slice(1).join("\n").trim();

      return (
        <div className="w-full">
          {/* Letter Page Branding Header */}
          <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <h2 className="font-serif italic text-3xl md:text-4xl text-text font-bold mb-2">Letter from Stewart Lucas</h2>
              <p className="text-xs text-primary font-bold tracking-widest uppercase">Founder & Head Nutritionist, NutriGuide</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
              <img
                src="/assets/stewart_lucas.webp"
                alt="Stewart Lucas"
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-sm"
              />
              <div className="text-left">
                <h4 className="font-serif font-bold text-sm text-text">Stewart Lucas</h4>
                <p className="text-[10px] text-text-muted">Master of Culinary Nutrition</p>
                <p className="text-[10px] text-primary font-semibold">stewartlucas.com</p>
              </div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="prose prose-lg prose-olive max-w-none text-left font-serif leading-relaxed text-gray-800 text-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={{
                ...customMarkdownComponents,
                // Make paragraphs in opening letter look more like a cozy letter
                p: ({ node, ...props }: any) => <p className="leading-relaxed text-gray-750 mb-6 font-serif italic text-lg" {...props} />
              }}
            >
              {bodyContent}
            </ReactMarkdown>
          </div>

          {/* Cursive Signature Block */}
          <div className="mt-12 pt-8 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="text-left">
              <p className="text-text-muted text-sm italic mb-2">With warmth and purpose,</p>
              <div className="font-serif text-3xl text-primary font-bold italic tracking-wide my-1">
                Stewart Lucas
              </div>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-1">Founder, NutriGuide</p>
            </div>
            <div className="max-w-xs text-left p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-xs text-primary font-serif italic leading-relaxed">
                "Cooking is an act of love, both for yourself and those you nourish."
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={customMarkdownComponents}
      >
        {sec.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 sm:px-6 lg:px-8">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; }
          nav, footer, .subscribe-popup, .back-link, .print-hide, .botpress-chat, #bp-web-widget, [id^="bp-"], .bp-web-widget-container { display: none !important; opacity: 0 !important; visibility: hidden !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; color: #1a1a1a !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; overflow: visible !important; }
          .max-w-6xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; overflow: visible !important; }
          .shadow-2xl, .shadow-sm { box-shadow: none !important; }
          .border { border: none !important; }
          .rounded-[2.5rem], .rounded-full { border-radius: 0 !important; }
          .bg-white { background: white !important; }
          .bg-gray-50/50 { background: transparent !important; }
          .px-8, .px-16 { padding-left: 0 !important; padding-right: 0 !important; }
          .prose { max-width: 100% !important; font-size: 11pt !important; line-height: 1.7 !important; color: #1a1a1a !important; }
          h1 { font-size: 26pt !important; margin-top: 0 !important; margin-bottom: 20pt !important; }
          h2 { font-size: 18pt !important; margin-top: 25pt !important; margin-bottom: 12pt !important; }
          h3 { font-size: 14pt !important; margin-top: 20pt !important; }
          p { margin-bottom: 12pt !important; }
          .page-break { page-break-before: always; }
        }
      `}} />

      <div className="max-w-6xl mx-auto">
        {/* Print-only Header */}
        <div className="hidden print:block mb-12 pb-8 border-b-2 border-primary/30">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-3">Premium Personalised Edition</p>
              <h1 className="text-4xl font-bold font-serif italic m-0 leading-tight">{request.content.title}</h1>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="font-serif text-2xl font-bold text-primary mb-1">Stewart Lucas</div>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase m-0">Culinary Excellence</p>
              <p className="text-[10px] text-primary font-medium m-0 mt-1">stewartlucas.com</p>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center print-hide">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            Premium Personalised Edition
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif italic">
            {request.content.title}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Crafted specifically for <span className="text-primary font-bold">{request.user.name || "you"}</span> based on your unique goals and dietary preferences.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12">
          {/* Top Bar with Actions */}
          <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 print-hide">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Generated on {new Date(request.createdAt).toLocaleDateString()}
            </div>
            <PersonalizedActions />
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-100 print-hide">
            {sections.map((sec, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-3 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  idx === activeTab
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-white text-gray-500 hover:text-text hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="block text-[8px] text-opacity-70 mb-0.5">Page {idx + 1}</span>
                <span className="truncate block max-w-full">{sec.title}</span>
              </button>
            ))}
          </div>

          {/* Screen View: Active Tab only */}
          <div className="print:hidden px-6 md:px-16 py-12 prose prose-lg prose-olive max-w-none">
            {renderSectionContent(sections[activeTab], activeTab)}
          </div>

          {/* Print View: Render all sections sequentially */}
          <div className="hidden print:block px-0 py-0 prose prose-lg prose-olive max-w-none">
            {sections.map((sec, idx) => (
              <div key={`print-${idx}`} className={idx > 0 ? "page-break mt-12 pt-12 border-t border-gray-200" : ""}>
                {renderSectionContent(sec, idx)}
              </div>
            ))}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="px-8 py-6 border-t border-gray-100 flex justify-between items-center print-hide">
            <button
              onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
              disabled={activeTab === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
            >
              &larr; Previous Page
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {activeTab + 1} of {sections.length}
            </span>
            <button
              onClick={() => setActiveTab((prev) => Math.min(sections.length - 1, prev + 1))}
              disabled={activeTab === sections.length - 1}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:hover:bg-primary transition-all cursor-pointer"
            >
              Next Page &rarr;
            </button>
          </div>

          {/* Footer Bar */}
          <div className="bg-gray-50/50 px-8 py-10 text-center border-t border-gray-100">
            <p className="text-gray-400 text-sm italic mb-0">
              "Cooking is an act of love, both for yourself and those you nourish."
            </p>
            <p className="text-primary font-bold text-sm mt-2">— Stewart Lucas</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center back-link">
          <a href="/" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            &larr; Back to Stewart Lucas Home
          </a>
        </div>
      </div>
    </div>
  );
}
