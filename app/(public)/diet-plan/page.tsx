import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diet Plans | NutriGuide",
  description: "Structured meal plans for weight loss, PCOS, diabetes, and overall wellness.",
};

export default async function DietPlansPage() {
  const plans = await prisma.content.findMany({
    where: { 
      type: "DIET_PLAN",
      published: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-gray-900">Diet Plans</h1>
        <p className="mt-4 text-xl text-gray-500">
          Structured meal plans for specific health goals.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No diet plans found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <ContentCard
              key={plan.id}
              type={plan.type as any}
              title={plan.title}
              slug={plan.slug}
              excerpt={plan.excerpt}
              coverImage={plan.coverImage}
              tags={JSON.parse(plan.tags)}
              hrefPrefix="diet-plan"
            />
          ))}
        </div>
      )}
    </div>
  );
}
