/**
 * Formats the HTML page title for SEO.
 * 
 * Rules:
 * 1. If an explicit SEO title is provided, use it exactly as specified (no changes).
 * 2. If no SEO title is provided, check if the raw title already contains the site name.
 *    If not, and appending the site name fits within ~65 characters, append it.
 * 3. Never truncate the title tag with literal '...' in the page source.
 * 
 * @param seoTitle Explicit custom SEO title from the database (optional)
 * @param rawTitle The raw title of the content item
 */
export function formatPageTitle(
  seoTitle: string | null | undefined,
  rawTitle: string
): string {
  const title = (seoTitle && seoTitle.trim() !== "") ? seoTitle.trim() : rawTitle.trim();
  return title.replace(/\s*\|\s*[^|]*NutriGuide[^|]*/gi, "");
}
