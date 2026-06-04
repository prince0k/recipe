"use client";

import React, { useEffect } from "react";
import Image from "next/image";

interface DietPlanPrintClientProps {
  content: {
    title: string;
    excerpt: string;
    body: string;
    coverImage?: string | null;
  };
  backUrl: string;
}

export function DietPlanPrintClient({ content, backUrl }: DietPlanPrintClientProps) {
  useEffect(() => {
    // Auto-trigger printing/PDF saving after 1.2 seconds
    const timer = setTimeout(() => {
      window.print();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formattedBody = typeof content.body === "string"
    ? content.body
        .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<table/g, '<div class="prose-table-wrapper"><table')
        .replace(/<\/table>/g, "</table></div>")
    : "";

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 sm:px-6 lg:px-8">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; }
          nav, footer, .subscribe-popup, .back-link, .print-hide, .botpress-chat, #bp-web-widget, [id^="bp-"], .bp-web-widget-container { display: none !important; opacity: 0 !important; visibility: hidden !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; color: #1a1a1a !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; overflow: visible !important; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; overflow: visible !important; }
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

      <div className="max-w-4xl mx-auto">
        {/* Print-only Header */}
        <div className="hidden print:block mb-12 pb-8 border-b-2 border-primary/30">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-3">NutriGuide Diet Plan Guide</p>
              <h1 className="text-4xl font-bold font-serif italic m-0 leading-tight">{content.title}</h1>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="font-serif text-2xl font-bold text-primary mb-1">Stewart Lucas</div>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase m-0">NutriGuide Founder</p>
              <p className="text-[10px] text-primary font-medium m-0 mt-1">stewartlucas.com</p>
            </div>
          </div>
        </div>

        {/* Screen Header Section */}
        <div className="mb-12 text-center print-hide">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            PDF Download Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif italic">
            {content.title}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Your download is ready. We have automatically opened the print dialog for you to save this guide as a PDF or print it.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12">
          {/* Top Bar with Actions */}
          <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 print-hide">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Print-Ready Guide
            </div>
            <button 
              onClick={handlePrint}
              className="rounded-full px-6 py-2.5 bg-primary text-white font-semibold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-sm cursor-pointer text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
          </div>

          {/* Main Body */}
          <div className="px-6 md:px-16 py-12">
            <p className="text-gray-650 leading-relaxed font-serif text-lg italic mb-8 border-l-4 border-primary/30 pl-4 print:mb-6">
              {content.excerpt}
            </p>

            {content.coverImage && (
              <div className="relative mb-12 aspect-[2/1] overflow-hidden rounded-2xl border border-border print:hidden">
                <Image
                  src={content.coverImage}
                  alt={content.title}
                  fill
                  className="object-cover"
                  unoptimized={content.coverImage.startsWith('/uploads')}
                />
              </div>
            )}

            <div 
              className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 prose-p:leading-relaxed prose-p:text-gray-700"
              style={{ fontSize: '1.125rem' }}
              dangerouslySetInnerHTML={{ __html: formattedBody }}
            />
          </div>

          {/* Footer Bar */}
          <div className="bg-gray-50/50 px-8 py-10 text-center border-t border-gray-100">
            <p className="text-gray-400 text-sm italic mb-0">
              "Simple recipes, clean ingredients, honest cooking."
            </p>
            <p className="text-primary font-bold text-sm mt-2">— Stewart Lucas</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center back-link">
          <a href={backUrl} className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            &larr; Back to Diet Plan Page
          </a>
        </div>
      </div>
    </div>
  );
}
