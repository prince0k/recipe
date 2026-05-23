import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Mail, Shield, Download, Calendar, Check, X, ArrowLeft, FileDown } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const sParams = await searchParams;
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1;
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const [users, totalCount, consentCount, adminCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: skip,
      include: {
        _count: {
          select: { downloads: true }
        }
      }
    }),
    prisma.user.count(),
    prisma.user.count({ where: { marketingConsent: true } }),
    prisma.user.count({ where: { role: "ADMIN" } })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
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
            Leads &amp; Users
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage your registered accounts, track user downloads, and monitor marketing opt-in consent stats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/api/admin/export" method="GET">
            <Button type="submit" variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-98">
              <FileDown className="w-4 h-4 text-slate-500" />
              Export CSV
            </Button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Accounts</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marketing Consent</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900">{consentCount.toLocaleString()}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-md">
                  {totalCount > 0 ? `${Math.round((consentCount / totalCount) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-2xl shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrators</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{adminCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-slate-100 overflow-hidden shadow-sm bg-white">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-850 font-serif text-lg">Registered Users Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing list of signups and download activity</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            Page {page} of {totalPages || 1}
          </span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Downloads</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Marketing Consent</th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => {
                  const userInitials = user.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase();
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                            {userInitials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {user.name || "Anonymous User"}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.role === "ADMIN" ? (
                          <Badge variant="warning" className="font-bold border border-yellow-200/50">
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="default" className="font-bold bg-slate-100 text-slate-700 border border-slate-200/50">
                            USER
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 font-bold text-sm text-slate-750 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/40">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          {user._count.downloads}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {user.marketingConsent ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
                            <X className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No leads or users registered in the database yet.
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
        baseUrl="/admin/leads"
      />
    </div>
  );
}
