"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, PlusCircle, ExternalLink } from "lucide-react";

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
    if (!confirm("Are you sure?")) return;
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
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Manage Partners</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-green-600" /> Add New Partner
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Partner Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Logo URL (optional)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            placeholder="Website URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Partner"}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading partners...</p>
        ) : partners.length === 0 ? (
          <p className="text-gray-500 italic">No partners added yet.</p>
        ) : (
          partners.map((partner) => (
            <div key={partner.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
              {partner.logo ? (
                <img src={partner.logo} alt={partner.name} className="h-16 object-contain mb-4" />
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold mb-4">
                  {partner.name[0]}
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{partner.name}</h3>
              {partner.url && (
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Visit Site
                </a>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleDelete(partner.id)} className="text-red-600 mt-auto">
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
