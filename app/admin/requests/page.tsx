import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Sparkles, Clock, Send, FileText, ArrowRight, ArrowLeft, Calendar, Mail, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sParams = await searchParams;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const [requests, totalCount, pendingCount, sentCount] = await Promise.all([
    prisma.personalizedRequest.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        content: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.personalizedRequest.count(),
    prisma.personalizedRequest.count({ where: { status: "PENDING" } }),
    prisma.personalizedRequest.count({ where: { status: "SENT" } })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

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
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-serif flex items-center gap-3">
            AI Personalisation Queue
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Review custom-tailored diet guides and recipes built by the AI engines, then approve and email them to users.
          </p>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Requests</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{pendingCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Delivered Guides</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{sentCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-100 overflow-hidden shadow-sm bg-white">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-850 font-serif text-lg">Personalised Guides List</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage and review generation queues</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-650 border border-slate-200/60">
            Page {page} of {totalPages || 1}
          </span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested By</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Content / Guide</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {req.user.name || "Anonymous"}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {req.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-slate-800 font-serif flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        {req.content.title}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {req.status === "SENT" ? (
                        <Badge variant="success" className="font-bold border border-green-200/50">
                          SENT &amp; DELIVERED
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="font-bold border border-yellow-200/50 animate-pulse">
                          PENDING REVIEW
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        Review
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-450 text-sm">
                      No personalisation requests found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        baseUrl="/admin/requests"
      />
    </div>
  );
}
