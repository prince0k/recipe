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
  if (seoTitle && seoTitle.trim() !== "") {
    return seoTitle.trim();
  }

  const title = rawTitle.trim();
  const siteName = "NutriGuide";
  const suffix = ` | ${siteName}`;

  // Check if title already contains "nutriguide" case-insensitively
  if (title.toLowerCase().includes(siteName.toLowerCase())) {
    return title;
  }

  // Only append site name if it fits within a reasonable page title length
  if (title.length + suffix.length <= 65) {
    return `${title}${suffix}`;
  }

  return title;
}
