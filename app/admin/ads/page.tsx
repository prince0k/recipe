"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Trash2, 
  PlusCircle, 
  ArrowLeft, 
  Megaphone, 
  Loader2, 
  ToggleLeft, 
  ToggleRight, 
  Layout, 
  Image as ImageIcon, 
  Code as CodeIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Info
} from "lucide-react";
import Link from "next/link";

interface Ad {
  id: string;
  title: string;
  imageUrl: string | null;
  targetUrl: string | null;
  adCode: string | null;
  placement: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("HOMEPAGE_BANNER");
  const [adType, setAdType] = useState<"IMAGE" | "SCRIPT">("IMAGE");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [adCode, setAdCode] = useState("");
  const [active, setActive] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch ads");
      }
    } catch (err) {
      console.error("Failed to fetch ads:", err);
      setError("An unexpected error occurred while fetching ads.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    // Basic validation
    if (!title.trim()) {
      setError("Title is required");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title,
      placement,
      active,
      imageUrl: adType === "IMAGE" ? imageUrl : null,
      targetUrl: adType === "IMAGE" ? targetUrl : null,
      adCode: adType === "SCRIPT" ? adCode : null,
    };

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg("Ad created successfully!");
        setTitle("");
        setImageUrl("");
        setTargetUrl("");
        setAdCode("");
        setActive(true);
        fetchAds();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to create ad");
      }
    } catch (err) {
      console.error("Failed to add ad:", err);
      setError("An unexpected error occurred while adding the ad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });

      if (res.ok) {
        setAds(ads.map((ad) => (ad.id === id ? { ...ad, active: !currentStatus } : ad)));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update ad status");
      }
    } catch (err) {
      console.error("Failed to toggle ad status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this ad placement?")) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAds(ads.filter((ad) => ad.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete ad");
      }
    } catch (err) {
      console.error("Failed to delete ad:", err);
    }
  };

  // Stats helper calculations
  const totalCount = ads.length;
  const activeCount = ads.filter(ad => ad.active).length;
  const homepageCount = ads.filter(ad => ad.placement === "HOMEPAGE_BANNER").length;
  const recipesCount = ads.filter(ad => ad.placement === "RECIPES_SIDEBAR").length;
  const blogCount = ads.filter(ad => ad.placement === "BLOG_SIDEBAR").length;
  const footerCount = ads.filter(ad => ad.placement === "GLOBAL_FOOTER").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Back & Title Header */}
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
            <Megaphone className="w-8 h-8 text-emerald-600" />
            Ads Manager
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Configure advertisements across key website positions. Toggle visibility or inject direct script blocks for Google AdSense &amp; custom networks.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-400 font-bold tracking-wide uppercase">Total Ads</p>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100">
              📊
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-400 font-bold tracking-wide uppercase">Active</p>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-emerald-600">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              🟢
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-400 font-bold tracking-wide uppercase">Banners</p>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">{homepageCount + footerCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              🔲
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-white">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-400 font-bold tracking-wide uppercase">Sidebars</p>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">{recipesCount + blogCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
              ⚡
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Container */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-100 shadow-sm bg-white sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-bold text-slate-900 font-serif text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                Configure Ad
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Define a banner placement or external script tag</p>
            </div>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <Input
                  label="Ad Campaign Title"
                  type="text"
                  placeholder="e.g. Summer Diet Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                />

                {/* Placement */}
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Placement Location
                  </label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <option value="HOMEPAGE_BANNER">Homepage Horizontal Banner (HOMEPAGE_BANNER)</option>
                    <option value="RECIPES_SIDEBAR">Recipe Page Sidebar (RECIPES_SIDEBAR)</option>
                    <option value="BLOG_SIDEBAR">Blog Post Sidebar (BLOG_SIDEBAR)</option>
                    <option value="GLOBAL_FOOTER">Global Footer Wide (GLOBAL_FOOTER)</option>
                  </select>
                </div>

                {/* Ad Type Tabs */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Ad Format</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-150">
                    <button
                      type="button"
                      onClick={() => setAdType("IMAGE")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        adType === "IMAGE" 
                          ? "bg-white text-emerald-600 shadow-sm border border-slate-100" 
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image Banner
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdType("SCRIPT")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        adType === "SCRIPT" 
                          ? "bg-white text-emerald-600 shadow-sm border border-slate-100" 
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <CodeIcon className="w-3.5 h-3.5" />
                      HTML / Script
                    </button>
                  </div>
                </div>

                {/* Dynamic Inputs */}
                {adType === "IMAGE" ? (
                  <div className="space-y-4 animate-fade-in">
                    <Input
                      label="Image Source URL"
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required={adType === "IMAGE"}
                      className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                    />
                    <Input
                      label="Target Click URL"
                      type="url"
                      placeholder="https://partner-website.com/landing-page"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-sm font-medium text-foreground">
                      Custom Script / HTML Code
                    </label>
                    <textarea
                      placeholder="<!-- Paste AdSense unit script or custom HTML here -->"
                      value={adCode}
                      onChange={(e) => setAdCode(e.target.value)}
                      required={adType === "SCRIPT"}
                      rows={6}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 font-mono"
                    />
                    <span className="text-[11px] text-slate-400 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                      <span>Google AdSense core libraries should be added in global site layout head. Insert only the ad unit snippet container and activation script block.</span>
                    </span>
                  </div>
                )}

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="active-toggle"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="active-toggle" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Publish immediately (Set Active)
                  </label>
                </div>

                {/* Feedback Messages */}
                {error && (
                  <div className="p-3.5 text-sm bg-red-50 text-red-650 rounded-xl border border-red-105 flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 text-sm bg-emerald-50 text-emerald-650 rounded-xl border border-emerald-105 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Create Advertisement
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Ads Listing Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 font-serif text-lg">Configured Ads</h3>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
              {totalCount} total
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading advertisements database...</p>
            </div>
          ) : ads.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                📢
              </div>
              <h4 className="font-bold text-slate-800 font-serif text-base mb-1">No Ads Configured</h4>
              <p className="text-sm text-slate-450 max-w-sm mx-auto">
                No active banner advertisements or custom script widgets have been defined. Configure your first campaign using the left panel.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {ads.map((ad) => {
                const isScript = !!ad.adCode;
                return (
                  <Card key={ad.id} className="border border-slate-100 bg-white hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                    <div className="p-5 space-y-4">
                      {/* Top Header Card Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-base font-serif truncate" title={ad.title}>
                            {ad.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                            ID: {ad.id}
                          </span>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleToggleActive(ad.id, ad.active)}
                          className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer shrink-0"
                          title={ad.active ? "Pause campaign" : "Resume campaign"}
                        >
                          {ad.active ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                          )}
                        </button>
                      </div>

                      {/* Info Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 flex items-center gap-1">
                          <Layout className="w-3.5 h-3.5" />
                          {ad.placement.replace("_", " ")}
                        </span>
                        
                        {isScript ? (
                          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">
                            <CodeIcon className="w-3.5 h-3.5" />
                            HTML Script
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image Banner
                          </span>
                        )}

                        {ad.active ? (
                          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                            Paused
                          </span>
                        )}
                      </div>

                      {/* Visual Preview Box */}
                      <div className="border border-slate-100 rounded-xl bg-slate-50 p-3 h-32 flex items-center justify-center overflow-hidden relative">
                        {isScript ? (
                          <div className="w-full h-full text-[11px] font-mono text-slate-500 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {ad.adCode}
                          </div>
                        ) : ad.imageUrl ? (
                          <div className="w-full h-full relative flex items-center justify-center">
                            <img 
                              src={ad.imageUrl} 
                              alt={ad.title} 
                              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            {ad.targetUrl && (
                              <a
                                href={ad.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold p-1 rounded-md flex items-center gap-0.5 hover:bg-black/85"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                Target
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-450 italic">No media defined</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(ad.id)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50/60 transition-colors flex items-center gap-1.5 font-bold text-xs rounded-lg h-8 px-2.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Ad
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
