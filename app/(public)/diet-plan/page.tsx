import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllDietPlans } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;

  let title = "Free Diet Plans & Meal Prep";
  let description = "Structured meal plans for simplified home cooking and healthy living.";
  
  if (page > 1) {
    title += ` - Page ${page}`;
    description += ` (Page ${page})`;
  }

  const formattedTitle = title.length + 13 <= 60 ? `${title} | NutriGuide` : title;
  const url = `https://stewartlucas.com/diet-plan${page > 1 ? `?page=${page}` : ""}`;

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    alternates: {
      canonical: `https://stewartlucas.com/diet-plan${page > 1 ? `?page=${page}` : ""}`,
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
          alt: "Diet Plans | Stewart Lucas",
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

export default async function DietPlansPage() {
  const plans = await getAllDietPlans();

  const breadcrumbItems = [{ label: "Diet Plans" }];

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://stewartlucas.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Diet Plans",
        "item": "https://stewartlucas.com/diet-plan"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <div className="w-full min-h-screen bg-background">
        {/* Header — full bleed */}
        <section className="w-full bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-4xl font-extrabold font-serif text-text">Diet Plans</h1>
            <p className="mt-4 text-xl text-text-muted">
              Structured meal plans designed for real life and real results.
            </p>
          </div>
        </section>

        {/* Content — full bleed */}
        <section className="w-full bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
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
        </section>
      </div>
    </>
  );
}
