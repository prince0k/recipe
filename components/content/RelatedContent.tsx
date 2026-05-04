import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";

export function RelatedContent({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      <h3 className="font-serif text-lg font-semibold text-foreground border-b pb-2">
        Explore More
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={`/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`}
            className="group block space-y-2"
          >
            {item.coverImage && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-border">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-[10px] uppercase px-1 py-0 h-4 border border-border bg-transparent text-muted-foreground">
                  {item.type.replace('_', ' ')}
                </Badge>
              </div>
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
