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

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div
              className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-4 hover:prose-a:text-muted-foreground prose-p:leading-relaxed prose-p:text-gray-700"
              style={{ fontSize: '1.125rem' }}
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <div className="rounded-lg border border-border bg-secondary/50 p-6">
                {content.type !== "BLOG" && (
                  <>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Get the full guide
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Download the complete PDF including grocery lists and meal prep instructions.
                    </p>
                  </>
                )}
                <div className="mt-6 space-y-4">
                  <FavoriteButton 
                    contentId={content.id} 
                    initialFavorited={isFavorited}
                    variant="outline"
                    className="w-full"
                  />
                  {content.type === "CHEAT_SHEET" ? (
                    <div className="pt-2 border-t border-border/20">
                      <EmailCaptureForm
                        source="cheatsheet"
                        heading="Get the Free PDF"
                        subheading="Instant download. No spam ever."
                        buttonText="Download Free PDF →"
                        freebie={content.slug}
                      />
                    </div>
                  ) : (
                    content.type !== "BLOG" && <DownloadGate content={content} />
                  )}
                  <ShareButton 
                    title={content.title} 
                    text={content.excerpt} 
                    variant="ghost"
                    className="w-full text-muted-foreground"
                  />
                </div>
              </div>
              
              <RelatedContent items={relatedItems || []} />
              
              {adComponent}
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-12">
          <Reviews contentId={content.id} />
        </div>
      </div>
    </article>
  );
}
