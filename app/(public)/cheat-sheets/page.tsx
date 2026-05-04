import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content/ContentCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cheat Sheets | NutriGuide",
  description: "Quick, downloadable PDF cheat sheets for nutrition and health.",
};

export default async function CheatSheetsPage() {
  const sheets = await prisma.content.findMany({
    where: { 
      type: "CHEAT_SHEET",
      published: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-8 mb-8">
        <h1 className="text-4xl font-extrabold font-serif text-gray-900">Cheat Sheets</h1>
        <p className="mt-4 text-xl text-gray-500">
          Quick guides and reference sheets you can download instantly.
        </p>
      </div>

      {sheets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">No cheat sheets found. Check back soon!</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
