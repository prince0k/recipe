"use client";

import { useState, useEffect, useCallback } from "react";

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

function DetailItem({ label, value, fullWidth }: { label: string; value: string | null | undefined; fullWidth?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-900 ${fullWidth ? "break-all" : "truncate"}`} title={value || undefined}>
        {value || <span className="text-gray-300">—</span>}
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (countryFilter) params.set("country", countryFilter);
      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setLoading(false);
    }
  }, [search, countryFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (countryFilter) params.set("country", countryFilter);
    params.set("format", "csv");
    window.open(`/api/admin/subscribers?${params.toString()}`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Subscriber Intelligence</h1>
        <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
          📥 Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Subscribers</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Subscribed Today</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Top Countries</h3>
          <div className="mt-2 space-y-1">
            {stats.topCountries.slice(0, 4).map((c, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{c.country}</span>
                <span className="font-semibold text-gray-900">{c.count}</span>
              </div>
            ))}
            {stats.topCountries.length === 0 && <p className="text-sm text-gray-400">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search by name, email, or city..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
        <input type="text" placeholder="Filter by country..." value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all sm:w-48" />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-1">📬</p>
            <p>No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser / Device</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.name || "—"}</div>
                      <div className="text-sm text-gray-500">{sub.email}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sub.country || "—"}</div>
                      <div className="text-sm text-gray-500">{[sub.city, sub.region].filter(Boolean).join(", ") || "—"}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sub.browser}{sub.browserVersion ? ` ${sub.browserVersion.split(".")[0]}` : ""}</div>
                      <div className="text-sm text-gray-500">{sub.os} · {sub.deviceType}</div>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="text-sm text-gray-900 truncate" title={sub.pageUrl || undefined}>
                        {sub.pageUrl ? (() => { try { return new URL(sub.pageUrl).pathname; } catch { return sub.pageUrl; } })() : "—"}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={sub.referrer || undefined}>
                        {sub.referrer ? (() => { try { return new URL(sub.referrer).hostname; } catch { return sub.referrer; } })() : "Direct"}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.createdAt)}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button onClick={() => setSelectedSub(sub)} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-400 text-right">
        Showing {subscribers.length} of {stats.total} subscribers
      </div>

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSub(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-serif">Subscriber Details</h2>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Name" value={selectedSub.name} />
                  <DetailItem label="Email" value={selectedSub.email} />
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Country" value={selectedSub.country} />
                  <DetailItem label="City" value={selectedSub.city} />
                  <DetailItem label="Region" value={selectedSub.region} />
                  <DetailItem label="Timezone" value={selectedSub.timezone} />
                  <DetailItem label="IP Address" value={selectedSub.ipAddress} />
                  <DetailItem label="Language" value={selectedSub.language} />
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Device &amp; Browser</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Browser" value={selectedSub.browser ? `${selectedSub.browser} ${selectedSub.browserVersion || ""}` : null} />
                  <DetailItem label="OS" value={selectedSub.os} />
                  <DetailItem label="Device Type" value={selectedSub.deviceType} />
                  <DetailItem label="Screen" value={selectedSub.screenRes} />
                </div>
                <div className="mt-3">
                  <DetailItem label="User Agent" value={selectedSub.userAgent} fullWidth />
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Source</h3>
                <DetailItem label="Subscribed On Page" value={selectedSub.pageUrl} fullWidth />
                <div className="mt-2">
                  <DetailItem label="Referrer" value={selectedSub.referrer || "Direct"} fullWidth />
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timestamp</h3>
                <DetailItem label="Subscribed At" value={formatDate(selectedSub.createdAt)} />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
