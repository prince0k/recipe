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
      published: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-gray-900">Health Blog</h1>
        <p className="mt-4 text-xl text-gray-500">
          Evidence-based articles to help you make informed decisions.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No articles found. Check back soon!</p>
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
