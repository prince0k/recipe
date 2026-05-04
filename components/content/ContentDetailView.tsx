import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { DownloadGate } from "./DownloadGate";

export function ContentDetailView({ content }: { content: any }) {
  if (!content) return null;

  let tags = [];
  try {
    if (typeof content.tags === 'string') {
      tags = JSON.parse(content.tags);
    } else if (Array.isArray(content.tags)) {
      tags = content.tags;
    }
  } catch (e) {}

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        {tags.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            {tags.map((t: string) => (
              <Badge key={t} variant="success">{t}</Badge>
            ))}
          </div>
        )}
        <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-gray-900 mb-6">
          {content.title}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {content.excerpt}
        </p>
      </div>

      {content.coverVideo ? (
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 shadow-lg bg-gray-900">
          <video
            src={content.coverVideo}
            poster={content.coverImage || undefined}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      ) : content.coverImage ? (
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 shadow-lg">
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 prose prose-lg prose-green max-w-none">
          {/* In a real app with Tiptap, this is HTML string */}
          <div dangerouslySetInnerHTML={{ __html: content.body }} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold font-serif mb-4">Get the full guide</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Download the complete PDF including grocery lists and meal prep instructions.
            </p>
            <DownloadGate content={content} />
          </div>
        </div>
      </div>
    </article>
  );
}
