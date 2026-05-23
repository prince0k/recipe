import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Globe, 
  ExternalLink,
  ArrowLeft,
  FileText,
  Download
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [
    totalViews, 
    uniqueVisitors, 
    totalDownloads, 
    topPaths, 
    viewsByCountry,
    topDownloads
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.groupBy({
      by: ['userId'],
      _count: true,
    }),
    prisma.download.count(),
    prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    }),
    prisma.pageView.groupBy({
      by: ['country'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    prisma.download.groupBy({
      by: ['contentId'],
      _count: { contentId: true },
      orderBy: { _count: { contentId: 'desc' } },
      take: 5
    })
  ]);

  // Fetch titles for top downloads to display them nicely
  const downloadContentIds = topDownloads.map(d => d.contentId);
  const contentMap = await prisma.content.findMany({
    where: { id: { in: downloadContentIds } },
    select: { id: true, title: true, type: true, slug: true }
  });

  const contentIdToInfo = new Map(contentMap.map(c => [c.id, c]));

  const formattedDownloads = topDownloads.map(d => {
    const info = contentIdToInfo.get(d.contentId);
    return {
      title: info?.title || "Unknown Content",
      type: info?.type || "RECIPE",
      slug: info?.slug || "",
      count: d._count.contentId
    };
  });

  const loggedInVisitors = uniqueVisitors.filter(v => v.userId !== null).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all duration-200 group bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
            Analytics &amp; Insights
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Monitor real-time visitors, user downloads, and traffic patterns with premium analytics breakdowns.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Page Views</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracked Visitors</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{loggedInVisitors.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-orange-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-orange-500/10 text-orange-600 rounded-2xl shadow-inner">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Downloads</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalDownloads.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-violet-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-violet-500/10 text-violet-600 rounded-2xl shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visitor Ratio</p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {totalViews > 0 ? `${Math.round((loggedInVisitors / totalViews) * 100)}%` : "0%"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Viewed Pages */}
        <Card className="lg:col-span-2 border border-slate-100 overflow-hidden shadow-sm bg-white">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-bold text-slate-850 font-serif text-lg">Top Trafficked Routes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most active pages visited by users</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live activity
            </span>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Path</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topPaths.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-6 font-mono text-sm text-slate-600 font-medium group-hover:text-emerald-600 transition-colors">
                        {item.path}
                      </td>
                      <td className="py-3.5 px-6 text-sm font-bold text-slate-900 text-right">
                        {item._count.path.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {topPaths.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-12 text-center text-slate-400 text-sm">
                        No page views tracked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Google Analytics & Geography */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* GA Callout */}
          <Card className="relative overflow-hidden border border-amber-200 bg-amber-50/20 shadow-sm rounded-2xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <CardContent className="p-6 space-y-5">
              <div className="flex gap-4">
                <div className="text-3xl p-3 bg-amber-100 text-amber-700 rounded-2xl h-fit shadow-sm">
                  📊
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-serif text-base">Google Analytics 4</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Refer to your Google Analytics dashboard for deep behavioral analysis including bounce rate, session duration, and campaign referrals.
                  </p>
                </div>
              </div>
              <a 
                href="https://analytics.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hover:shadow-md hover:shadow-amber-500/10 active:scale-98"
              >
                Open Google Analytics <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>

          {/* Top Countries pageviews */}
          <Card className="border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="font-bold text-slate-900 font-serif text-base flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Traffic by Location
                </h3>
              </div>
            </div>
            <CardContent className="p-5 divide-y divide-slate-100">
              {viewsByCountry.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 text-sm first:pt-0 last:pb-0">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {item.country || "Direct/Unknown"}
                  </span>
                  <span className="font-bold text-slate-900 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg text-xs">
                    {item._count.id.toLocaleString()} views
                  </span>
                </div>
              ))}
              {viewsByCountry.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No countries tracked yet.</p>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Top Downloads Table */}
      <Card className="border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-lg">Top Downloaded Content</h3>
            <p className="text-xs text-slate-400 mt-0.5">Understand user demand and document rankings</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
            User demand ranking
          </span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Content Piece</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="py-3.5 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formattedDownloads.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        /{item.type.toLowerCase()}/{item.slug}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-slate-900 text-right">
                      {item.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {formattedDownloads.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 text-sm">
                      No items downloaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

