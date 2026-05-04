import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Blog | NutriGuide",
  description: "Evidence-based articles on nutrition, diet, and health conditions.",
};

export default async function BlogPage() {
  const posts = await prisma.content.findMany({
    where: {
      type: "BLOG",
      published: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-border pb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Latest Articles
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Health Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Evidence-based articles to help you make informed decisions about your health and nutrition.
          </p>
        </div>

        {/* Content */}
        {posts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/50 py-20">
            <p className="text-muted-foreground">No articles found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ContentCard
                key={post.id}
                type={post.type as "BLOG"}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                coverImage={post.coverImage}
                tags={JSON.parse(post.tags)}
                hrefPrefix="blog"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
