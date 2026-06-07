import { DietPlansClient } from "@/components/content/DietPlansClient";
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
      <div className="w-full bg-[#faf9f6] dark:bg-[#141211] pt-6 border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      <DietPlansClient list={plans} />
    </>
  );
}

