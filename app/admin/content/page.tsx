import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { DeleteContentButton } from "@/components/admin/DeleteContentButton";
import { GenerateRecipeButton } from "@/components/admin/GenerateRecipeButton";
import { GenerateAllPendingButton } from "@/components/admin/GenerateAllPendingButton";
import { ImageModeSelector } from "@/components/admin/ImageModeSelector";
import { GenerateCoverButton } from "@/components/admin/GenerateCoverButton";
import { GenerateAllCoversButton } from "@/components/admin/GenerateAllCoversButton";
import { BulkPublishButton } from "@/components/admin/BulkPublishButton";
import { Pagination } from "@/components/ui/Pagination";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  BookOpen, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const activeTab = typeof sParams.type === 'string' ? sParams.type.toLowerCase() : "all";
  const imageMode = typeof sParams.imageMode === 'string' ? sParams.imageMode : "prompt";
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build query filter
  const where: any = {};
  if (activeTab === "all") {
    where.type = { not: "PENDING_RECIPE" };
  } else if (activeTab === "pending_recipe") {
    where.type = "PENDING_RECIPE";
  } else if (activeTab === "pending_image") {
    where.type = { not: "PENDING_RECIPE" };
    where.OR = [
      { coverImage: null },
      { coverImage: "" },
      { coverImage: { contains: "unsplash.com" } },
      { coverImage: { contains: "hero.png" } },
      { coverImage: { contains: "placeholder" } }
    ];
  } else {
    where.type = activeTab.toUpperCase();
  }

  // Get total counts for badge indicators
  const [contentItems, totalCount, pendingCount, pendingItemsList, pendingImageCount, pendingImageItemsList] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: skip,
      select: {
        id: true,
        title: true,
        type: true,
        slug: true,
        published: true,
        createdAt: true,
        _count: {
          select: { downloads: true }
        }
      }
    }),
    prisma.content.count({ where }),
    prisma.content.count({ where: { type: "PENDING_RECIPE" } }),
    prisma.content.findMany({
      where: { type: "PENDING_RECIPE" },
      select: { id: true, title: true }
    }),
    prisma.content.count({
      where: {
        type: { not: "PENDING_RECIPE" },
        OR: [
          { coverImage: null },
          { coverImage: "" },
          { coverImage: { contains: "unsplash.com" } },
          { coverImage: { contains: "hero.png" } },
          { coverImage: { contains: "placeholder" } }
        ]
      }
    }),
    prisma.content.findMany({
      where: {
        type: { not: "PENDING_RECIPE" },
        OR: [
          { coverImage: null },
          { coverImage: "" },
          { coverImage: { contains: "unsplash.com" } },
          { coverImage: { contains: "hero.png" } },
          { coverImage: { contains: "placeholder" } }
        ]
      },
      select: { id: true, title: true }
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const showBulkPublish = ["all", "recipe", "diet_plan", "cheat_sheet", "blog"].includes(activeTab);
  const draftIdsForTab = showBulkPublish
    ? (await prisma.content.findMany({
        where: {
          ...where,
          published: false,
        },
        select: { id: true }
      })).map(item => item.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in pb-20">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            Content Library
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Create, edit, publish, and manage all your culinary recipes and articles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "pending_recipe" && (
            <>
              <ImageModeSelector />
              {pendingItemsList.length > 0 && (
                <GenerateAllPendingButton items={pendingItemsList} imageMode={imageMode} />
              )}
            </>
          )}
          {activeTab === "pending_image" && pendingImageItemsList.length > 0 && (
            <GenerateAllCoversButton items={pendingImageItemsList} />
          )}
          {showBulkPublish && draftIdsForTab.length > 0 && (
            <BulkPublishButton 
              ids={draftIdsForTab} 
              label={activeTab === "all" ? "drafts" : `${activeTab.replace('_', ' ')} drafts`} 
            />
          )}
          <Link href="/admin/content/ai-generator" className="inline-flex">
            <Button variant="outline" className="flex items-center gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl transition-all duration-200 shadow-sm font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              AI Assistant
            </Button>
          </Link>
          <Link href="/admin/content/new" className="inline-flex">
            <Button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-slate-950/20 active:scale-98 font-bold text-xs sm:text-sm px-4">
              <Plus className="w-4 h-4" />
              Create Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-px">
        {[
          { label: "All Content", value: "all" },
          { label: "Recipes", value: "recipe" },
          { label: "Diet Plans", value: "diet_plan" },
          { label: "Cheat Sheets", value: "cheat_sheet" },
          { label: "Blogs", value: "blog" },
          { label: "Pending Recipes", value: "pending_recipe", count: pendingCount },
          { label: "Pending Images", value: "pending_image", count: pendingImageCount }
        ].map(tab => {
          const isActive = activeTab === tab.value;
          const href = tab.value === "all" ? "/admin/content" : `/admin/content?type=${tab.value}`;
          return (
            <Link key={tab.value} href={href} className="inline-flex">
              <button
                type="button"
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-xl flex items-center gap-1.5 ${
                  isActive 
                    ? "text-slate-900 border-slate-900 bg-slate-50/50" 
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/20"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Main Table Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/75">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Title &amp; Path</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Downloads</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {contentItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors hidden sm:block">
                        {item.type === "RECIPE" ? <BookOpen className="w-4.5 h-4.5" /> : <FileText className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {item.type === "PENDING_RECIPE" ? "(Pending recipe)" : `/${item.type.toLowerCase().replace('_', '-')}/${item.slug}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      item.type === "RECIPE" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : item.type === "PENDING_RECIPE"
                        ? "bg-amber-50/40 text-amber-700 border-amber-100/50"
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.type === "PENDING_RECIPE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100">
                        Pending
                      </span>
                    ) : item.published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100">
                        <AlertCircle className="w-3.5 h-3.5" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-slate-400" />
                      {item.type === "PENDING_RECIPE" ? "-" : item._count.downloads.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                    <div className="flex items-center justify-end gap-3.5">
                      {activeTab === "pending_image" ? (
                        <>
                          <GenerateCoverButton id={item.id} title={item.title} />
                          <a 
                            href={`/admin/content/${item.id}`} 
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            title="Edit Content"
                          >
                            <Edit2 className="w-4 h-4" />
                          </a>
                          <DeleteContentButton 
                            id={item.id} 
                            title={item.title}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </DeleteContentButton>
                        </>
                      ) : item.type === "PENDING_RECIPE" ? (
                        <>
                          <GenerateRecipeButton id={item.id} title={item.title} imageMode={imageMode} />
                          <DeleteContentButton 
                            id={item.id} 
                            title={item.title}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </DeleteContentButton>
                        </>
                      ) : (
                        <>
                          <a 
                            href={`/admin/content/${item.id}`} 
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            title="Edit Content"
                          >
                            <Edit2 className="w-4 h-4" />
                          </a>
                          <DeleteContentButton 
                            id={item.id} 
                            title={item.title}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </DeleteContentButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {contentItems.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm font-semibold text-slate-500">No content items found.</p>
            <p className="text-xs text-slate-400 mt-1">Get started by creating a new recipe or article.</p>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        baseUrl={activeTab === "all" ? "/admin/content" : `/admin/content?type=${activeTab}`}
      />
    </div>
  );
}
