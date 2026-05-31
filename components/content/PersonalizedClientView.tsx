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

const getChildrenText = (children: any): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getChildrenText).join("");
  if (children && children.props && children.props.children) return getChildrenText(children.props.children);
  return "";
};

const customMarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="font-serif italic text-3xl md:text-4xl mb-6 text-text font-bold" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="font-serif italic text-2xl md:text-3xl mt-10 mb-5 text-text font-bold" {...props} />,
  h3: ({ node, children, ...props }: any) => {
    const text = getChildrenText(children);
    const matchDayOthers = text.match(/^Day\s+([2-9]|\d{2,})\b/i);
    const className = `font-serif italic text-xl md:text-2xl mt-8 mb-4 text-primary font-bold ${matchDayOthers ? "print-page-break" : ""}`;
    return <h3 className={className} {...props}>{children}</h3>;
  },
  h4: ({ node, children, ...props }: any) => {
    const text = getChildrenText(children);
    const matchDayOthers = text.match(/^Day\s+([2-9]|\d{2,})\b/i);
    const className = `font-serif italic text-lg md:text-xl mt-6 mb-3 text-text font-bold ${matchDayOthers ? "print-page-break" : ""}`;
    return <h4 className={className} {...props}>{children}</h4>;
  },
  p: ({ node, children, ...props }: any) => {
    const text = getChildrenText(children);
    const matchDay1 = text.match(/^Day\s+1\b/i);
    const matchDayOthers = text.match(/^Day\s+([2-9]|\d{2,})\b/i);

    if (matchDay1) {
      return (
        <h3 className="font-serif italic text-xl md:text-2xl mt-8 mb-4 text-primary font-bold" {...props}>
          {children}
        </h3>
      );
    }
    if (matchDayOthers) {
      return (
        <h3 className="font-serif italic text-xl md:text-2xl mt-8 mb-4 text-primary font-bold print-page-break" {...props}>
          {children}
        </h3>
      );
    }

    return <p className="leading-relaxed text-gray-755 text-sm md:text-base mb-6" {...props}>{children}</p>;
  },
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

  let displayTitle = request.content.title;
  let cleanContent = request.generatedContent || "";

  // Try to parse custom title from the beginning of the generatedContent
  const titleMatch = cleanContent.match(/^\s*#\s+(.+)$/m);
  if (titleMatch) {
    displayTitle = titleMatch[1].replace(/\*|_/g, "").trim();
    // Remove the title line from content
    cleanContent = cleanContent.replace(/^\s*#\s+.+$/m, "").trim();
  }

  // Parse markdown into distinct pages based on the 8 main uppercase headings
  const rawSections = cleanContent.split(/(?=^(?:###|##|#)?\s*(?:\*\*|__)?(?:(?:1\.\s+)?LETTER FROM STEWART LUCAS|(?:1\.\s+)?PERSONAL OPENING LETTER|\d+[\.:]\s*(?:\*\*|__)?[^a-z\n]+)(?:\*\*|__)?\s*$)/m);
  
  let intro = "";
  let sections: { title: string; content: string }[] = [];

  rawSections.forEach((sec: string) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    // Get the first line of the section to verify if it is a main heading
    const firstLine = trimmed.split("\n")[0].trim();
    const match = firstLine.match(/^(?:###|##|#)?\s*(?:\*\*|__)?(?:(\d+)[\.:]\s*(?:\*\*|__)?)?([^a-z]+)(?:\*\*|__)?$/);

    if (match && (match[1] || match[2].includes("LETTER FROM STEWART") || match[2].includes("PERSONAL OPENING") || match[2].includes("CINEMATIC MEAL PLAN") || match[2].toUpperCase().includes("BLUEPRINT") || match[2].toUpperCase().includes("SUPPORT SYSTEM") || match[2].toUpperCase().includes("SHOPPING LIST") || match[2].toUpperCase().includes("PREP GUIDE") || match[2].toUpperCase().includes("WATCH FOR") || match[2].toUpperCase().includes("CLOSING"))) {
      const num = match[1] ? parseInt(match[1]) : 1;
      let cleanTitle = match[2].replace(/\*|_/g, "").trim();
      const upperTitle = cleanTitle.toUpperCase();

      if (upperTitle.includes("PERSONAL OPENING") || upperTitle.includes("OPENING LETTER") || upperTitle.includes("LETTER FROM STEWART")) {
        cleanTitle = "LETTER FROM STEWART LUCAS";
      } else if (upperTitle.includes("TRANSFORMATION BLUEPRINT") || upperTitle.includes("BLUEPRINT")) {
        cleanTitle = "YOUR WEEKLY BLUEPRINT";
      } else if (upperTitle.includes("POWERFUL SUPPORT SYSTEM") || upperTitle.includes("SUPPORT SYSTEM")) {
        cleanTitle = "DAILY SOS & SUPPORT STRATEGIES";
      } else if (upperTitle.includes("CINEMATIC MEAL PLAN") || upperTitle.includes("7-DAY MEAL PLAN") || upperTitle.includes("MEAL PLAN")) {
        cleanTitle = "YOUR 7-DAY MEAL PLAN";
      } else if (upperTitle.includes("SHOPPING LIST")) {
        cleanTitle = "YOUR WEEKLY GROCERY LIST";
      } else if (upperTitle.includes("PREP GUIDE")) {
        cleanTitle = "SUNDAY MEAL PREP GUIDE";
      } else if (upperTitle.includes("WHAT TO WATCH FOR") || upperTitle.includes("WATCH FOR")) {
        cleanTitle = "TRACKING YOUR BODY'S SIGNALS";
      } else if (upperTitle.includes("PERSONAL CLOSING") || upperTitle.includes("CLOSING FROM STEWART") || upperTitle.includes("CLOSING FROM")) {
        cleanTitle = "A FINAL NOTE FROM STEWART";
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
    sections = [{ title: "Personalized Plan", content: cleanContent }];
  }

  const renderSectionContent = (sec: { title: string; content: string }, idx: number) => {
    const isOpeningLetter = sec.title.toUpperCase().includes("LETTER FROM STEWART LUCAS") || 
                           sec.title.toUpperCase().includes("PERSONAL OPENING LETTER");

    // Clean any robotic headers/buzzwords inside content
    let displayContent = sec.content
      .replace(/YOUR 7-DAY CINEMATIC MEAL PLAN/gi, "YOUR 7-DAY MEAL PLAN")
      .replace(/CINEMATIC MEAL PLAN/gi, "MEAL PLAN")
      .replace(/1\.\s+PERSONAL OPENING LETTER/gi, "LETTER FROM STEWART LUCAS")
      .replace(/PERSONAL OPENING LETTER/gi, "LETTER FROM STEWART LUCAS");

    // Extract body content by skipping the first line (header)
    const contentLines = displayContent.split("\n");
    const bodyContent = contentLines.slice(1).join("\n").trim();

    if (isOpeningLetter) {
      return (
        <div className="w-full">
          {/* Letter Page Centered Branding Header */}
          <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col items-center text-center gap-4">
            <img
              src="/assets/stewart_lucas.webp"
              alt="Stewart Lucas"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow-md"
            />
            <div>
              <h2 className="font-serif italic text-3xl md:text-4xl text-text font-bold mb-2">Letter from Stewart Lucas</h2>
              <p className="text-xs text-primary font-bold tracking-widest uppercase">Head Nutritionist, NutriGuide</p>
            </div>
          </div>

          {/* Letter Body */}
          <div className="prose prose-lg prose-olive max-w-none text-left font-serif leading-relaxed text-gray-800 text-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={{
                ...customMarkdownComponents,
                // Make paragraphs in opening letter look more like a cozy letter
                p: ({ node, ...props }: any) => <p className="leading-relaxed text-gray-755 mb-6 font-serif italic text-lg" {...props} />
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
              <p className="text-xs text-text-muted uppercase tracking-widest mt-1">Head Nutritionist, NutriGuide</p>
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
      <div className="w-full">
        {/* Centered Heading without Numbering */}
        <div className="text-center mb-10">
          <h2 className="font-serif italic text-3xl md:text-4xl text-text font-bold mb-2">
            {sec.title}
          </h2>
          <div className="w-12 h-1 bg-primary/20 mx-auto mt-4 rounded-full print-hide"></div>
        </div>

        {/* Section Body */}
        <div className="prose prose-lg prose-olive max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={customMarkdownComponents}
          >
            {bodyContent}
          </ReactMarkdown>
        </div>
      </div>
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
          .print-page-break { page-break-before: always !important; break-before: page !important; }
        }
      `}} />

      <div className="max-w-6xl mx-auto">
        {/* Print-only Header */}
        <div className="hidden print:block mb-12 pb-8 border-b-2 border-primary/30">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-3">Premium Personalised Edition</p>
              <h1 className="text-4xl font-bold font-serif italic m-0 leading-tight">{displayTitle}</h1>
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
            {displayTitle}
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
