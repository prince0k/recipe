import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllDietPlans } from "@/lib/queries";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Diet Plans | Stwart Lucas",
  description: "Structured meal plans for simplified home cooking and healthy living.",
};

export default async function DietPlansPage() {
  const plans = await getAllDietPlans();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-text">Diet Plans</h1>
        <p className="mt-4 text-xl text-text-muted">
          Structured meal plans designed for real life and real results.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-border cinematic-shadow">
          <p className="text-text-muted text-lg font-serif italic">No diet plans found. Check back soon!</p>
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
