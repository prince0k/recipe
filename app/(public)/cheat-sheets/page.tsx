import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllCheatSheets } from "@/lib/queries";
import { Pagination } from "@/components/ui/Pagination";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;

  let title = "Cheat Sheets | Stewart Lucas";
  let description = "Quick, downloadable guides for simplified home cooking and kitchen mastery.";
  
  if (page > 1) {
    title += ` - Page ${page}`;
    description += ` (Page ${page})`;
  }

  const url = `https://stewartlucas.com/cheat-sheets${page > 1 ? `?page=${page}` : ""}`;

  return {
    metadataBase: new URL('https://stewartlucas.com'),
    title,
    description,
    alternates: {
      canonical: `https://stewartlucas.com/cheat-sheets${page > 1 ? `?page=${page}` : ""}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: "https://stewartlucas.com/assets/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Cheat Sheets | Stewart Lucas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
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

export default async function CheatSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 9;

  const { data: sheets, totalPages } = await getAllCheatSheets(page, pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-border pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-text">Cheat Sheets</h1>
        <p className="mt-4 text-xl text-text-muted">
          Quick reference guides for every home cook. Download and print for your kitchen.
        </p>
      </div>

      {sheets.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-border cinematic-shadow">
          <p className="text-text-muted text-lg font-serif italic">No cheat sheets found. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sheets.map((sheet) => (
              <ContentCard
                key={sheet.id}
                type={sheet.type as any}
                title={sheet.title}
                slug={sheet.slug}
                excerpt={sheet.excerpt}
                coverImage={sheet.coverImage}
                tags={JSON.parse(sheet.tags)}
                hrefPrefix="cheat-sheets"
              />
            ))}
          </div>

          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl="/cheat-sheets"
          />
        </>
      )}
    </div>
  );
}

