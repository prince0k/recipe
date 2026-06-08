"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { DownloadGate } from "./DownloadGate";
import { EmailCaptureForm } from "@/components/ui/EmailCaptureForm";
import { RelatedContent } from "./RelatedContent";
import { FavoriteButton } from "./FavoriteButton";
import { ShareButton } from "./ShareButton";
import { Reviews } from "./Reviews";
import { uploadsLoader } from "@/lib/image-loader";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { ShareButtons } from "@/components/ui/ShareButtons";

export function ContentDetailView({ 
  content, 
  relatedItems, 
  isFavorited = false,
  adComponent,
  breadcrumbs
}: { 
  content: any, 
  relatedItems?: any[], 
  isFavorited?: boolean,
  adComponent?: React.ReactNode,
  breadcrumbs?: BreadcrumbItem[]
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

  const contentUrl = (() => {
    switch (content.type) {
      case "DIET_PLAN":
        return `/diet-plan/${content.slug}`;
      case "BLOG":
        return `/blog/${content.slug}`;
      case "CHEAT_SHEET":
        return `/cheat-sheets/${content.slug}`;
      case "RECIPE":
        return `/recipes/${content.slug}`;
      default:
        return `/recipes/${content.slug}`;
    }
  })();

  const mediaOverlay = (
    <div className="absolute top-4 right-4 flex gap-2.5 z-10">
      <FavoriteButton 
        contentId={content.id} 
        initialFavorited={isFavorited}
        showText={false}
        variant="ghost"
        className="h-10 w-10 !p-0 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 text-text"
      />
      <ShareButton 
        title={content.title} 
        text={content.excerpt} 
        showText={false}
        variant="ghost"
        className="h-10 w-10 !p-0 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 text-text-muted hover:text-text"
      />
    </div>
  );

  return (
    <article className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
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
          <div className="mt-6 flex justify-center">
            <ShareButtons 
              url={contentUrl} 
              title={content.title} 
              image={
                content.slug === "7-day-soy-free-meal-plan"
                  ? "/uploads/soy-free-pinterest.png"
                  : (content.coverImage || undefined)
              }
              theme="light"
            />
          </div>
        </div>

        {/* Fallback actions if no cover media exists */}
        {!content.coverImage && !content.coverVideo && (
          <div className="mb-8 flex justify-center border-y border-border/60 py-4 max-w-md mx-auto">
            {mediaOverlay}
          </div>
        )}

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
            {mediaOverlay}
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
              fetchPriority="high"
              loader={content.coverImage.startsWith('/uploads/images/') && content.coverImage.endsWith('.webp') ? uploadsLoader : undefined}
              unoptimized={!content.coverImage.startsWith('/uploads/images/') && content.coverImage.startsWith('/uploads')}
            />
            {mediaOverlay}
          </div>
        ) : null}

        {/* Main Content Column */}
        <div className="mx-auto max-w-3xl">
          {(() => {
            const formattedBody = typeof content.body === "string"
              ? content.body
                  .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
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

          {/* Bottom Social Share Bar */}
          <div className="mt-8 pt-6 border-t border-border/60 flex justify-center sm:justify-start">
            <ShareButtons 
              url={contentUrl} 
              title={content.title} 
              image={
                content.slug === "7-day-soy-free-meal-plan"
                  ? "/uploads/soy-free-pinterest.png"
                  : (content.coverImage || undefined)
              }
              theme="light"
            />
          </div>

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
                    variant="light"
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
          {/* Author Bio Box */}
          <div className="mt-12 bg-surface p-8 rounded-[2rem] border border-border flex flex-col md:flex-row items-center md:items-start gap-8 text-left">
            <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20">
              <Image
                src="/assets/stewart_lucas.webp"
                alt="Stewart Lucas"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div>
                <h3 className="font-bold text-xl text-text">Stewart Lucas</h3>
                <span className="text-xs uppercase tracking-widest font-bold text-primary">Certified Nutritionist & Culinary Coach</span>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                Stewart Lucas is the founder of NutriGuide. With over a decade of clinical experience in nutrition, hormone balance, and dietetic consulting, Stewart simplifies home cooking with science-backed diet plans, healthy ingredient hacks, and easy culinary techniques.
              </p>
            </div>
          </div>
        </div>

        {relatedItems && relatedItems.length > 0 && (
          <RelatedContent items={relatedItems} title="Explore More" />
        )}

        <div className="mt-20 border-t border-border pt-12">
          <Reviews contentId={content.id} />
        </div>
      </div>
    </article>
  );
}
