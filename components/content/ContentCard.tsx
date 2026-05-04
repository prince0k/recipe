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
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:shadow-md group-hover:border-[#10b981]/30">
        {coverImage ? (
          <div className="relative w-full h-48 overflow-hidden bg-gray-100">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 backdrop-blur text-xs font-semibold shadow-sm text-gray-800">
                {typeLabels[type]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            <span className="text-sm font-medium">{typeLabels[type]}</span>
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 backdrop-blur text-xs font-semibold shadow-sm text-gray-800">
                {typeLabels[type]}
              </Badge>
            </div>
          </div>
        )}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-2 group-hover:text-[#10b981] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
            {excerpt}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-400 px-1 py-1">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
