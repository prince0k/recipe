import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { DownloadGate } from "./DownloadGate";
import { EmailCaptureForm } from "@/components/ui/EmailCaptureForm";
import { RelatedContent } from "./RelatedContent";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";
import { Reviews } from "./Reviews";

export function ContentDetailView({ 
  content, 
  relatedItems, 
  isFavorited = false,
  adComponent
}: { 
  content: any, 
  relatedItems?: any[], 
  isFavorited?: boolean,
  adComponent?: React.ReactNode 
}) {
  if (!content) return null;

  let tags: string[] = [];
  try {
    if (typeof content.tags === "string") {
      tags = JSON.parse(content.tags);
    } else if (Array.isArray(content.tags)) {
      tags = content.tags;
    }
  } catch (e) {
    // ignore parse errors
  }

  return (
    <article className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {tags.map((t: string) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            {content.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {content.excerpt}
          </p>
          
          {/* Quick Actions Toolbar */}
          <div className="mt-8 flex justify-center gap-4 border-y border-border/60 py-4 max-w-md mx-auto">
            <FavoriteButton 
              contentId={content.id} 
              initialFavorited={isFavorited}
              className="rounded-full px-6"
            />
            <ShareButton 
              title={content.title} 
              text={content.excerpt} 
              variant="outline"
              className="rounded-full px-6 text-muted-foreground hover:bg-secondary/15"
            />
          </div>
        </div>

        {/* Cover Media */}
        {content.coverVideo ? (
          <div className="relative mb-12 aspect-[2/1] overflow-hidden rounded-lg border border-border bg-foreground">
            <video
              src={content.coverVideo}
              poster={content.coverImage || undefined}
              controls
              preload="metadata"
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        ) : content.coverImage ? (
          <div className="relative mb-12 aspect-[2/1] overflow-hidden rounded-lg border border-border">
            <Image
              src={content.coverImage}
              alt={content.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
              unoptimized={content.coverImage?.startsWith('/uploads')}
            />
          </div>
        ) : null}

        {/* Main Content Column */}
        <div className="mx-auto max-w-3xl">
          {(() => {
            const formattedBody = typeof content.body === "string"
              ? content.body
                  .replace(/<table/g, '<div class="prose-table-wrapper"><table')
                  .replace(/<\/table>/g, "</table></div>")
              : "";
            return (
              <div
                className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 hover:prose-a:text-muted-foreground prose-p:leading-relaxed prose-p:text-gray-700"
                style={{ fontSize: '1.125rem' }}
                dangerouslySetInnerHTML={{ __html: formattedBody }}
              />
            );
          })()}

          {/* Bottom Call to Action for Downloading PDF */}
          {content.type !== "BLOG" && (
            <div className="mt-12 p-8 rounded-[2rem] border border-border bg-surface cinematic-shadow flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="max-w-md text-left">
                <h3 className="font-serif text-xl font-bold text-text">
                  Get the Full Guide
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  Download the complete PDF version including grocery lists and meal prep instructions for easy printing and offline reading.
                </p>
              </div>
              <div className="w-full sm:w-auto flex-shrink-0">
                {content.type === "CHEAT_SHEET" ? (
                  <EmailCaptureForm
                    source="cheatsheet"
                    heading="Get the Free PDF"
                    subheading="Instant download. No spam ever."
                    buttonText="Download Free PDF"
                    freebie={content.slug}
                  />
                ) : (
                  <DownloadGate content={content} />
                )}
              </div>
            </div>
          )}

          {/* Ad Component */}
          {adComponent && (
            <div className="mt-12 flex justify-center border-t border-border/40 pt-8">
              {adComponent}
            </div>
          )}
        </div>

        {relatedItems && relatedItems.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <RelatedContent items={relatedItems} />
          </div>
        )}

        <div className="mt-20 border-t border-border pt-12">
          <Reviews contentId={content.id} />
        </div>
      </div>
    </article>
  );
}
