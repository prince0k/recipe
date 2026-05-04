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
            Structured Plans
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Diet Plans
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Science-backed meal plans designed for weight loss, PCOS management, diabetes control, and overall wellness.
          </p>
        </div>

        {/* Content */}
        {plans.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/50 py-20">
            <p className="text-muted-foreground">No diet plans found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <ContentCard
                key={plan.id}
                type={plan.type as "DIET_PLAN"}
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
    </div>
  );
}
