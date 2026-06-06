"use client";

import React, { useState, useEffect, useRef } from "react";

interface ExpandableSectionProps {
  title: string;
  html: string;
}

export function ExpandableSection({ title, html }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSwapsSection = /variations|swaps/i.test(title);

  // Split into teaser + remainder for normal prose
  const pTagRegex = /<\/p>/i;
  const match = html.match(pTagRegex);
  const hasMultipleParagraphs = match ? html.substring(match.index! + 4).trim().length > 0 : false;

  const pCloseIndex = match ? match.index! : -1;
  const teaserHtml = match ? html.substring(0, pCloseIndex + 4) : html;
  const remainderHtml = match ? html.substring(pCloseIndex + 4).trim() : "";

  // Helper to inject inline controls before the final closing tag
  const injectReadMore = (htmlStr: string) => {
    const lastPClose = htmlStr.lastIndexOf("</p>");
    if (lastPClose !== -1) {
      return (
        htmlStr.substring(0, lastPClose) +
        `<span class="inline-read-more text-primary hover:underline cursor-pointer font-bold ml-2 text-sm font-sans tracking-wide transition-all">... Read More</span>` +
        htmlStr.substring(lastPClose)
      );
    }
    return htmlStr + ` <span class="inline-read-more text-primary hover:underline cursor-pointer font-bold text-sm font-sans tracking-wide transition-all">... Read More</span>`;
  };

  const injectReadLess = (htmlStr: string) => {
    const lastPClose = htmlStr.lastIndexOf("</p>");
    if (lastPClose !== -1) {
      return (
        htmlStr.substring(0, lastPClose) +
        `<span class="inline-read-less text-primary hover:underline cursor-pointer font-bold ml-2 text-sm font-sans tracking-wide transition-all"> (Read Less)</span>` +
        htmlStr.substring(lastPClose)
      );
    }
    return htmlStr + ` <span class="inline-read-less text-primary hover:underline cursor-pointer font-bold text-sm font-sans tracking-wide transition-all"> (Read Less)</span>`;
  };

  // Setup DOM event listeners for the inline spans
  useEffect(() => {
    if (isSwapsSection || !hasMultipleParagraphs) return;

    const container = containerRef.current;
    if (!container) return;

    const readMoreSpan = container.querySelector(".inline-read-more");
    const readLessSpan = container.querySelector(".inline-read-less");

    const handleReadMore = (e: Event) => {
      e.preventDefault();
      setIsExpanded(true);
    };

    const handleReadLess = (e: Event) => {
      e.preventDefault();
      setIsExpanded(false);
    };

    if (readMoreSpan) {
      readMoreSpan.addEventListener("click", handleReadMore);
    }
    if (readLessSpan) {
      readLessSpan.addEventListener("click", handleReadLess);
    }

    return () => {
      if (readMoreSpan) {
        readMoreSpan.removeEventListener("click", handleReadMore);
      }
      if (readLessSpan) {
        readLessSpan.removeEventListener("click", handleReadLess);
      }
    };
  }, [isExpanded, html, isSwapsSection, hasMultipleParagraphs]);

  // If it's the variations & swaps section, we format it as cards
  if (isSwapsSection) {
    const pMatch = html.match(/<p>([\s\S]*?)<\/p>/i);
    const introParagraph = pMatch ? pMatch[0] : "";
    const liMatches = html.match(/<li>([\s\S]*?)<\/li>/gi);
    const cards: { title: string; desc: string }[] = [];

    if (liMatches) {
      liMatches.forEach(li => {
        const content = li.replace(/<\/?li>/gi, "").trim();
        const strongMatch = content.match(/<strong>(.*?)<\/strong>(?:\s*:)?(.*)/i);
        if (strongMatch) {
          cards.push({
            title: strongMatch[1].replace(/:$/, "").trim(),
            desc: strongMatch[2].replace(/^:/, "").replace(/^\s*-\s*/, "").trim()
          });
        } else {
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

  // If section only has 1 paragraph, render normally without collapse features
  if (!hasMultipleParagraphs) {
    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
          {title}
        </h2>
        <div
          className="prose prose-lg prose-olive max-w-none text-text-muted leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    );
  }

  // Prose collapsing layout using ref-bound inline triggers
  return (
    <section className="space-y-4" ref={containerRef}>
      <h2 className="text-3xl font-bold font-serif text-text border-b border-border/60 pb-2">
        {title}
      </h2>

      {!isExpanded ? (
        /* Collapsed State: Teaser with inline "... Read More" */
        <div
          className="prose prose-lg prose-olive max-w-none text-text-muted leading-relaxed"
          dangerouslySetInnerHTML={{ __html: injectReadMore(teaserHtml) }}
        />
      ) : (
        /* Expanded State: Full content with inline "(Read Less)" at the very end */
        <div
          className="prose prose-lg prose-olive max-w-none text-text-muted leading-relaxed space-y-4 animate-fade-in"
          dangerouslySetInnerHTML={{
            __html: teaserHtml + " " + injectReadLess(remainderHtml)
          }}
        />
      )}
    </section>
  );
}
