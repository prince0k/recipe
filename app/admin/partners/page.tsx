"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Trash2, PlusCircle, ExternalLink, ArrowLeft, Handshake, Globe, Link2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (err) {
      console.error("Failed to fetch partners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo, url }),
      });
      if (res.ok) {
        setName("");
        setLogo("");
        setUrl("");
        fetchPartners();
      }
    } catch (err) {
      console.error("Failed to add partner:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner?")) return;
    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPartners(partners.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete partner:", err);
    }
  };

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
            Partners &amp; Affiliates
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage collaborations with external brands, configure their showcase logos, and edit destination links.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Container */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-100 shadow-sm bg-white sticky top-6">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-bold text-slate-900 font-serif text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                Add New Partner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Integrate a new sponsor or collaborative brand</p>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Partner Name"
                  type="text"
                  placeholder="e.g. Organic Valley"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                />
                <Input
                  label="Logo URL (optional)"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                />
                <Input
                  label="Website URL (optional)"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Handshake className="w-4 h-4" />
                      Add Partner
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Partners Grid List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 font-serif text-lg">Active Partnerships</h3>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
              {partners.length} {partners.length === 1 ? 'Partner' : 'Partners'} total
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500">Loading partner profiles...</p>
            </div>
          ) : partners.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 border border-slate-200/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🤝
              </div>
              <h4 className="font-bold text-slate-800 font-serif text-base mb-1">No Partners Added Yet</h4>
              <p className="text-sm text-slate-450 max-w-sm mx-auto">
                Collaborate with wellness brands and display their profiles. Add your first partner using the side panel.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partners.map((partner) => {
                const partnerInitials = partner.name.slice(0, 2).toUpperCase();
                return (
                  <Card key={partner.id} className="border border-slate-100 bg-white hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group overflow-hidden">
                    <div className="p-6 flex items-start gap-4">
                      {partner.logo ? (
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-150 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-200">
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
                          {partnerInitials}
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-base truncate font-serif">
                          {partner.name}
                        </h4>
                        {partner.url ? (
                          <a 
                            href={partner.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            Visit Web Portal
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Link2 className="w-3 h-3" />
                            No link attached
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(partner.id)} 
                        className="text-red-500 hover:text-red-750 hover:bg-red-50/60 transition-colors flex items-center gap-1.5 font-bold text-xs rounded-lg h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Brand
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
