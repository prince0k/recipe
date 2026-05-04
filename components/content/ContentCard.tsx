import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface ContentCardProps {
  type: "RECIPE" | "DIET_PLAN" | "CHEAT_SHEET" | "BLOG";
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  tags?: string[];
  hrefPrefix: string;
}

export function ContentCard({ type, title, slug, excerpt, coverImage, tags = [], hrefPrefix }: ContentCardProps) {
  const typeLabels = {
    RECIPE: "Recipe",
    DIET_PLAN: "Diet Plan",
    CHEAT_SHEET: "Cheat Sheet",
    BLOG: "Article"
  };

  return (
    <Link href={`/${hrefPrefix}/${slug}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-500 group-hover:cinematic-shadow border-border overflow-hidden bg-white rounded-3xl">
        {coverImage ? (
          <div className="relative w-full h-64 overflow-hidden bg-surface">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-white text-xs font-bold px-3 py-1 shadow-lg border-none">
                {typeLabels[type]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-64 bg-surface flex items-center justify-center text-text-muted">
            <span className="text-sm font-medium font-serif italic">{typeLabels[type]}</span>
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-2xl font-bold font-serif text-text mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-text-muted text-sm line-clamp-2 mb-6 flex-grow leading-relaxed italic">
            {excerpt}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] uppercase tracking-widest font-bold text-olive bg-olive/5 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-primary font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform duration-300">
              View <span className="ml-1">→</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
