import React from "react";
import { prisma } from "@/lib/db";
import { AdScriptRenderer } from "./AdScriptRenderer";

interface AdBannerProps {
  placement: "HOMEPAGE_BANNER" | "RECIPES_SIDEBAR" | "BLOG_SIDEBAR" | "GLOBAL_FOOTER";
  className?: string;
}

export async function AdBanner({ placement, className = "" }: AdBannerProps) {
  try {
    // Fetch active ads for the specified placement
    const ads = await prisma.ad.findMany({
      where: {
        placement,
        active: true,
      },
    });

    if (!ads || ads.length === 0) {
      return null;
    }

    // Pick a random ad to rotate impressions
    const randomIndex = Math.floor(Math.random() * ads.length);
    const ad = ads[randomIndex];

    // Determine placement-specific styles
    let placementStyles = "";
    if (placement === "HOMEPAGE_BANNER" || placement === "GLOBAL_FOOTER") {
      placementStyles = "max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8";
    } else {
      // Sidebar placements
      placementStyles = "w-full my-6";
    }

    return (
      <div className={`ad-container ${placementStyles} ${className}`} data-ad-id={ad.id} data-ad-placement={placement}>
        {/* Ad label */}
        <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mb-1.5 text-center">
          Advertisement
        </div>
        
        <div className="flex justify-center items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          {ad.adCode ? (
            <AdScriptRenderer adCode={ad.adCode} />
          ) : ad.imageUrl ? (
            <a
              href={ad.targetUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block w-full group overflow-hidden"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title || "Advertisement"}
                className="w-full h-auto max-h-[250px] object-cover mx-auto group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </a>
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm italic">
              Invalid Ad Configuration
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Failed to render AdBanner for placement ${placement}:`, error);
    return null;
  }
}
