"use client";

import React from "react";

interface ExpandableSectionProps {
  title: string;
  html: string;
}

export function ExpandableSection({ title, html }: ExpandableSectionProps) {
  const isSwapsSection = /variations|swaps/i.test(title);

  // If it's the variations & swaps section, we format it as cards (fully expanded)
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

  // Normal prose sections or FAQ sections are rendered fully expanded by default
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
