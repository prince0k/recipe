export function buildImageObject(coverImage: string | null, baseUrl = "https://stewartlucas.com") {
  const raw = coverImage ?? "/assets/og-image.jpg";
  const cleaned = raw.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, "");
  const url = cleaned.startsWith("http") ? cleaned : `${baseUrl}${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
  return { "@type": "ImageObject", url, width: 1200, height: 630 };
}
