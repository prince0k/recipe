import React from "react";
import Link from "next/link";
import Image from "next/image";
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

const typeLabels = {
  RECIPE: "Recipe",
  DIET_PLAN: "Diet Plan",
  CHEAT_SHEET: "Cheat Sheet",
  BLOG: "Article",
};

export function ContentCard({
  type,
  title,
  slug,
  excerpt,
  coverImage,
  tags = [],
  hrefPrefix,
}: ContentCardProps) {
  return (
    <Link href={`/${hrefPrefix}/${slug}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 hover:border-foreground/20">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">{typeLabels[type]}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <span className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {typeLabels[type]}
          </span>
          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {excerpt}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-1 py-1 text-xs text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
