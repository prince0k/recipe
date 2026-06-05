"use client";

import React, { useState } from "react";

interface ExpandableSectionProps {
  title: string;
  html: string;
}

export function ExpandableSection({ title, html }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSwapsSection = /variations|swaps/i.test(title);

  // If it's the variations & swaps section, we format it as cards
  if (isSwapsSection) {
    // Extract intro paragraph if any
    const pMatch = html.match(/<p>([\s\S]*?)<\/p>/i);
    const introParagraph = pMatch ? pMatch[0] : "";

    // Extract list items <li>
    const liMatches = html.match(/<li>([\s\S]*?)<\/li>/gi);
    const cards: { title: string; desc: string }[] = [];

    if (liMatches) {
      liMatches.forEach(li => {
        const content = li.replace(/<\/?li>/gi, "").trim();
        // Look for <strong>Title:</strong> or <strong>Title</strong>: or just Title:
        const strongMatch = content.match(/<strong>(.*?)<\/strong>(?:\s*:)?(.*)/i);
        if (strongMatch) {
          cards.push({
            title: strongMatch[1].replace(/:$/, "").trim(),
            desc: strongMatch[2].replace(/^:/, "").replace(/^\s*-\s*/, "").trim()
          });
        } else {
          // Fallback if no strong tag
          const colonIndex = content.indexOf(":");
          if (colonIndex !== -1) {
            cards.push({
              title: content.substring(0, colonIndex).trim(),
              desc: content.substring(colonIndex + 1).replace(/^:/, "").trim()
            });
          } else {
            cards.push({
              title: "Variation",
              desc: content
            });
          }
        }
      });
    }

    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
          {title}
        </h2>
        {introParagraph && (
          <div
            className="text-text-muted text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: introParagraph }}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border-l-4 border-l-primary border border-y-border border-r-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-2"
            >
              <h4 className="font-bold font-serif text-text text-base md:text-lg">
                {card.title}
              </h4>
              <p className="text-sm text-text-muted leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Normal prose section: split into teaser + remainder
  const pTagRegex = /<\/p>/i;
  const match = html.match(pTagRegex);

  if (!match) {
    // If no closing p tag, render standard content
    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
          {title}
        </h2>
        <div
          className="prose prose-lg prose-olive max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    );
  }

  const pCloseIndex = match.index!;
  const teaserHtml = html.substring(0, pCloseIndex + 4);
  const remainderHtml = html.substring(pCloseIndex + 4).trim();

  // If there is no remainder, just render without toggle
  if (!remainderHtml) {
    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
          {title}
        </h2>
        <div
          className="prose prose-lg prose-olive max-w-none"
          dangerouslySetInnerHTML={{ __html: teaserHtml }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
        {title}
      </h2>
      
      {/* Teaser Paragraph */}
      <div
        className="prose prose-lg prose-olive max-w-none text-text-muted leading-relaxed"
        dangerouslySetInnerHTML={{ __html: teaserHtml }}
      />

      {/* Remainder Paragraphs */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="prose prose-lg prose-olive max-w-none text-text-muted leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: remainderHtml }}
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="no-print inline-flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-border/40 text-primary font-bold text-xs uppercase tracking-wider rounded-xl border border-border shadow-sm transition-all duration-300"
      >
        <span>{isExpanded ? "Read Less" : "Read More"}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "transform rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}
