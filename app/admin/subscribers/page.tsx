"use client";

import { useState, useEffect, useCallback } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Users, 
  TrendingUp, 
  Globe, 
  Search, 
  Mail, 
  Calendar, 
  Info, 
  Download, 
  Monitor, 
  Compass, 
  ArrowLeft, 
  X, 
  FileDown, 
  Loader2, 
  MapPin
} from "lucide-react";
import Link from "next/link";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  deviceType: string | null;
  userAgent: string | null;
  screenRes: string | null;
  language: string | null;
  referrer: string | null;
  pageUrl: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  today: number;
  topCountries: { country: string; count: number }[];
}

function DetailItem({ label, value, icon: Icon, fullWidth }: { label: string; value: string | null | undefined; icon?: any; fullWidth?: boolean }) {
  return (
    <div className={`p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 ${fullWidth ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-450" />}
        {label}
      </span>
      <p className={`text-sm font-semibold text-slate-805 ${fullWidth ? "break-all" : "truncate"}`} title={value || undefined}>
        {value || <span className="text-slate-350 font-normal italic">not specified</span>}
      </p>
    </div>
  );
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, topCountries: [] });
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscriber | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (countryFilter) params.set("country", countryFilter);
      params.set("page", page.toString());
      params.set("limit", "25");
      
      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, countryFilter, page]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, countryFilter]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (countryFilter) params.set("country", countryFilter);
    params.set("format", "csv");
    window.open(`/api/admin/subscribers?${params.toString()}`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit",
    });
  };

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
            Subscriber Intelligence
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Monitor real-time newsletter subscriptions, track geographic conversion demographics, and review subscriber profiles.
          </p>
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 border border-slate-200 text-slate-750 bg-white hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-98 text-sm"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Audience</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-blue-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-2xl shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed Up Today</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">+{stats.today.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="relative overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-600" /> Top Location Shares
            </p>
            <div className="space-y-1.5">
              {stats.topCountries.slice(0, 3).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold truncate max-w-[120px]">{c.country || "Direct/Unknown"}</span>
                  <span className="font-bold text-slate-805 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">{c.count} converts</span>
                </div>
              ))}
              {stats.topCountries.length === 0 && (
                <p className="text-xs text-slate-400 italic py-1">No region data recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Form */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-inner">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text" 
            placeholder="Search by name, email, or city..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
          />
        </div>
        <div className="md:w-60 relative">
          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text" 
            placeholder="Filter by country..." 
            value={countryFilter} 
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
          />
        </div>
      </div>

      {/* Subscribers Table List */}
      <Card className="border border-slate-100 overflow-hidden shadow-sm bg-white">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="font-bold text-slate-850 font-serif text-lg">Subscriptions List</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing list of registered email subscribers</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-650 border border-slate-200/60">
            Page {page} of {totalPages || 1}
          </span>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500">Loading newsletter directory...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 text-slate-450">
              <span className="text-3xl mb-2 block">📬</span>
              <p className="font-bold">No Subscribers Found</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Adjust search parameters or country filters to view results.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Subscriber</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Geographic Location</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Browser &amp; OS</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Sign Up Path</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Added</th>
                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribers.map((sub) => {
                    const initials = sub.name 
                      ? sub.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() 
                      : sub.email.slice(0, 2).toUpperCase();
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {sub.name || "Anonymous Subscriber"}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {sub.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-slate-800">
                            {sub.country || <span className="text-slate-350 font-normal italic">unknown</span>}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[155px]">
                            {[sub.city, sub.region].filter(Boolean).join(", ") || <span className="text-slate-350 italic">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-slate-450" />
                            {sub.browser}{sub.browserVersion ? ` ${sub.browserVersion.split(".")[0]}` : ""}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Monitor className="w-3 h-3 text-slate-450" />
                            {sub.os || "Unknown OS"} · {sub.deviceType || "Desktop"}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-[180px]">
                          <div className="text-xs font-semibold text-slate-700 truncate" title={sub.pageUrl || undefined}>
                            {sub.pageUrl ? (() => { try { return new URL(sub.pageUrl).pathname; } catch { return sub.pageUrl; } })() : "—"}
                          </div>
                          <div className="text-xs text-slate-405 truncate mt-0.5" title={sub.referrer || undefined}>
                            {sub.referrer ? (() => { try { return new URL(sub.referrer).hostname; } catch { return sub.referrer; } })() : "Direct Traffic"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(sub.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setSelectedSub(sub)} 
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                            Telemetry
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={(p) => setPage(p)}
      />

      <div className="text-xs font-bold text-slate-400 text-right bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 w-fit ml-auto">
        Showing {subscribers.length} records on page {page}
      </div>

      {/* Telemetry Detail Modal Overlay */}
      {selectedSub && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300 animate-fade-in" 
          onClick={() => setSelectedSub(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-100 animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">Subscriber Diagnostics</h2>
                  <p className="text-xs text-slate-400">Complete tracking &amp; browser data</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSub(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-450 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-200/40"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Card Section 1: User Identity */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Identity Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailItem label="Full Name" value={selectedSub.name} icon={Users} />
                  <DetailItem label="Email Address" value={selectedSub.email} icon={Mail} />
                </div>
              </section>

              {/* Card Section 2: Geo Telemetry */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Geographical Telemetry
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <DetailItem label="Country" value={selectedSub.country} />
                  <DetailItem label="Region / Province" value={selectedSub.region} />
                  <DetailItem label="City" value={selectedSub.city} />
                  <DetailItem label="Timezone" value={selectedSub.timezone} />
                  <DetailItem label="IP Address" value={selectedSub.ipAddress} />
                  <DetailItem label="Preferred Language" value={selectedSub.language} />
                </div>
              </section>

              {/* Card Section 3: Browser Specs */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  Device &amp; Session Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <DetailItem label="Browser Client" value={selectedSub.browser ? `${selectedSub.browser} ${selectedSub.browserVersion || ""}` : null} />
                  <DetailItem label="Operating System" value={selectedSub.os} />
                  <DetailItem label="Device Type" value={selectedSub.deviceType} />
                  <DetailItem label="Screen Specs" value={selectedSub.screenRes} />
                </div>
                <div className="mt-2">
                  <DetailItem label="Raw User Agent string" value={selectedSub.userAgent} fullWidth />
                </div>
              </section>

              {/* Card Section 4: Lead Source */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Conversion Source
                </h3>
                <div className="space-y-3">
                  <DetailItem label="Conversion Page URL" value={selectedSub.pageUrl} fullWidth />
                  <DetailItem label="Acquisition Referrer" value={selectedSub.referrer || "Direct Link/Bookmark"} fullWidth />
                </div>
              </section>

              {/* Timestamp */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Subscriber ID: {selectedSub.id}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Subscribed on {formatDate(selectedSub.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
