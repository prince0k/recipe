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
            Quick Reference
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Cheat Sheets
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Downloadable PDF guides for grocery shopping, macro tracking, and meal prep strategies.
          </p>
        </div>

        {/* Content */}
        {sheets.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/50 py-20">
            <p className="text-muted-foreground">No cheat sheets found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sheets.map((sheet) => (
              <ContentCard
                key={sheet.id}
                type={sheet.type as "CHEAT_SHEET"}
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
    </div>
  );
}
