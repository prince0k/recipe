import React from "react";
import Link from "next/link";
import Image from "next/image";

export function RelatedContent({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-2xl font-bold text-text border-b border-border pb-3">
        Explore More
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.slice(0, 4).map((item) => (
          <Link 
            key={item.id} 
            href={
              item.type === "RECIPE" ? `/recipes/${item.slug}` :
              item.type === "CHEAT_SHEET" ? `/cheat-sheets/${item.slug}` :
              `/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`
            }
            className="group block space-y-3 rounded-2xl border border-border bg-surface/50 p-3 hover:shadow-lg transition-all duration-300"
          >
            {item.coverImage ? (
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={item.coverImage?.startsWith('/uploads')}
                />
              </div>
            ) : (
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  {item.type.replace('_', ' ')}
                </span>
              </div>
            )}
            <div className="px-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1">
                {item.type.replace('_', ' ')}
              </span>
              <h4 className="font-serif text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
