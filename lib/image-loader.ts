/**
 * Custom Next.js Image loader to serve pre-generated responsive variants.
 * This avoids dynamically resizing images on the fly via Next.js server,
 * and loads the optimal static pre-compressed WebP file directly.
 * 
 * Safe to import in both client and server components since it has no Node.js/Sharp dependencies.
 */
export function uploadsLoader({ src, width }: { src: string; width: number }): string {
  if (!src || !src.startsWith("/uploads/images/") || !src.endsWith(".webp")) {
    return src;
  }

  // Strip any pre-existing responsive suffixes so we can dynamically select the best size
  const cleanSrc = src
    .replace("-tablet.webp", ".webp")
    .replace("-mobile.webp", ".webp")
    .replace("-thumb.webp", ".webp");

  const base = cleanSrc.substring(0, cleanSrc.length - 5); // remove .webp
  if (width <= 200) return `${base}-thumb.webp`;
  if (width <= 480) return `${base}-mobile.webp`;
  if (width <= 800) return `${base}-tablet.webp`;
  return cleanSrc;
}

