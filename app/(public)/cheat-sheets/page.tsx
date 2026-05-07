import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";
import { getAllCheatSheets } from "@/lib/queries";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Cheat Sheets | Stwart Lucas",
  description: "Quick, downloadable guides for simplified home cooking and kitchen mastery.",
};

export default async function CheatSheetsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
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

