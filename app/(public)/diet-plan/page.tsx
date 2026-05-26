import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllDietPlans } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;

  let title = "Diet Plans | Stewart Lucas";
  let description = "Structured meal plans for simplified home cooking and healthy living.";
  
  if (page > 1) {
    title += ` - Page ${page}`;
    description += ` (Page ${page})`;
  }

  const url = `https://stewartlucas.com/diet-plan${page > 1 ? `?page=${page}` : ""}`;

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    alternates: {
      canonical: `/diet-plan${page > 1 ? `?page=${page}` : ""}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: "/assets/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Diet Plans | Stewart Lucas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/og-image.jpg"],
    },
  };
}

export default async function DietPlansPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/diet-plan");
  }

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
