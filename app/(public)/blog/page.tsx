import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/queries";
import { Pagination } from "@/components/ui/Pagination";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;

  let title = "Healthy Living Blog & Stories";
  let description = "Articles on home cooking, kitchen techniques, and the simple joy around the table.";
  
  if (page > 1) {
    title += ` - Page ${page}`;
    description += ` (Page ${page})`;
  }

  const formattedTitle = title.length + 13 <= 60 ? `${title} | NutriGuide` : title;
  const url = `https://stewartlucas.com/blog${page > 1 ? `?page=${page}` : ""}`;

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    alternates: {
      canonical: `https://stewartlucas.com/blog${page > 1 ? `?page=${page}` : ""}`,
    },
    openGraph: {
      title: formattedTitle,
      description,
      type: "website",
      url,
      images: [
        {
          url: "https://stewartlucas.com/assets/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Kitchen Stories | Stewart Lucas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description,
      images: ["https://stewartlucas.com/assets/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 9;
  
  const { data: posts, totalPages } = await getAllBlogPosts(page, pageSize);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header — full bleed */}
      <section className="w-full bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <h1 className="text-4xl font-extrabold font-serif text-text">Kitchen Stories</h1>
          <p className="mt-4 text-xl text-text-muted">
            Inspiration for your kitchen and stories from our culinary journey.
          </p>
        </div>
      </section>

      {/* Content — full bleed */}
      <section className="w-full bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-border cinematic-shadow">
              <p className="text-text-muted text-lg font-serif italic">No articles found. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <ContentCard
                    key={post.id}
                    type={post.type as any}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    tags={JSON.parse(post.tags)}
                    hrefPrefix="blog"
                  />
                ))}
              </div>

              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                baseUrl="/blog"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

