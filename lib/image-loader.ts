/**
 * Custom Next.js Image loader to serve pre-generated responsive variants.
 * This avoids dynamically resizing images on the fly via Next.js server,
 * and loads the optimal static pre-compressed WebP file directly.
 * 
 * Safe to import in both client and server components since it has no Node.js/Sharp dependencies.
 */
export function uploadsLoader({ src, width }: { src: string; width: number }): string {
  if (
    !src ||
    !src.startsWith("/uploads/images/") ||
    !src.endsWith(".webp") ||
    src.includes("-mobile.webp") ||
    src.includes("-tablet.webp") ||
    src.includes("-thumb.webp")
  ) {
    return src;
  }
  const base = src.substring(0, src.length - 5); // remove .webp
  if (width <= 200) return `${base}-thumb.webp`;
  if (width <= 480) return `${base}-mobile.webp`;
  if (width <= 800) return `${base}-tablet.webp`;
  return src;
}
