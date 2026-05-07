import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/queries";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Kitchen Stories | Stwart Lucas",
  description: "Articles on home cooking, kitchen techniques, and the cinematic life around the table.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-text">Kitchen Stories</h1>
        <p className="mt-4 text-xl text-text-muted">
          Inspiration for your kitchen and stories from our culinary journey.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-border cinematic-shadow">
          <p className="text-text-muted text-lg font-serif italic">No articles found. Check back soon!</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
