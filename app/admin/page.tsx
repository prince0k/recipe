import { getAdminDashboardStats } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { 
  Users, 
  Download, 
  Sparkles, 
  DollarSign, 
  Star, 
  Mail, 
  Plus, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const {
    totalUsers,
    recentDownloads,
    publishedContent,
    latestUsers,
    totalSubscribers,
    pendingRequestsCount,
    pendingReviewsCount,
    aiStats,
    pendingReviews,
    pendingRequests,
    growthTrend,
    contentDistribution,
    subscribersByCountry
  } = await getAdminDashboardStats();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10b981]/10 text-[#10b981] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> System Administrator
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-serif">Command Center</h1>
          <p className="text-gray-500 mt-1">Real-time health, operations, and user statistics for NutriGuide.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content/new"
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Content
          </Link>
          <Link
            href="/admin/content/ai-generator"
            className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI Generator
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Total Users */}
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Leads</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscribers */}
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-[#10b981]">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribers</span>
              <div className="p-2 bg-[#10b981]/10 rounded-lg text-[#10b981]">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalSubscribers}</p>
              <p className="text-xs text-[#10b981] mt-1 font-semibold">Newsletter updates</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Downloads */}
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Downloads</span>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Download className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{recentDownloads}</p>
              <p className="text-xs text-gray-500 mt-1">Ebooks & checklists</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className={`hover:shadow-md transition-all duration-300 border-l-4 ${pendingRequestsCount > 0 ? "border-l-red-500 bg-red-50/10" : "border-l-gray-300"}`}>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Requests</span>
              <div className={`p-2 rounded-lg ${pendingRequestsCount > 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}`}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{pendingRequestsCount}</p>
                {pendingRequestsCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                    Action
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pending response</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className={`hover:shadow-md transition-all duration-300 border-l-4 ${pendingReviewsCount > 0 ? "border-l-amber-500 bg-amber-50/10" : "border-l-gray-300"}`}>
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Reviews</span>
              <div className={`p-2 rounded-lg ${pendingReviewsCount > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-600"}`}>
                <Star className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{pendingReviewsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Requires moderation</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Estimated Cost */}
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Operations</span>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                ${aiStats.totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{aiStats.totalRequests} API calls logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <DashboardCharts 
        growthTrend={growthTrend} 
        contentDistribution={contentDistribution} 
        subscribersByCountry={subscribersByCountry}
      />

      {/* Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending AI Requests Feed */}
        <Card className="lg:col-span-1 border-t-2 border-t-red-500">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-pulse"></span>
              AI Requests ({pendingRequests.length})
            </h3>
            <Link href="/admin/requests" className="text-xs font-bold text-[#10b981] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CardContent className="p-0 divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-gray-900 line-clamp-1">{req.user.name || "Anonymous"}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-[#10b981] font-medium truncate mb-2">{req.content.title}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold">PENDING</span>
                  <Link href={`/admin/requests/${req.id}`} className="text-xs text-slate-800 hover:text-black font-semibold flex items-center gap-0.5">
                    Generate &rarr;
                  </Link>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">🎉</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending personalized requests.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Reviews Feed */}
        <Card className="lg:col-span-1 border-t-2 border-t-amber-500">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
              Moderation Queue ({pendingReviews.length})
            </h3>
            <Link href="/admin/reviews" className="text-xs font-bold text-[#10b981] hover:underline flex items-center gap-1">
              Moderate <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CardContent className="p-0 divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
            {pendingReviews.map((rev) => (
              <div key={rev.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-gray-900 line-clamp-1">{rev.user.name || "Anonymous"}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 truncate mb-1">On: <span className="font-medium text-gray-700">{rev.content.title}</span></div>
                <p className="text-xs text-gray-600 line-clamp-2 italic">&ldquo;{rev.comment}&rdquo;</p>
              </div>
            ))}
            {pendingReviews.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">✨</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">Queue is clear</p>
                <p className="text-xs text-gray-400 mt-1">No reviews pending approval.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads Feed */}
        <Card className="lg:col-span-1 border-t-2 border-t-blue-500">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
              Recent Registrations
            </h3>
            <Link href="/admin/leads" className="text-xs font-bold text-[#10b981] hover:underline flex items-center gap-1">
              Manage Leads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CardContent className="p-0 divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
            {latestUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="min-w-0 pr-4">
                  <p className="font-semibold text-sm text-gray-900 truncate">{user.name || "N/A"}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
