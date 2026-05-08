"use client";

import { useState, useEffect } from "react";

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
}

export function PartnerFooter() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/partners");
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      }
    };
    fetchPartners();
  }, []);

  if (partners.length === 0) return null;

  return (
    <div className="mt-12 border-t border-border pt-12">
      <h3 className="text-sm font-semibold text-text tracking-wider uppercase font-serif mb-8 text-center">
        Our Trusted Partners
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
        {partners.map((partner) => (
          <a
            key={partner.id}
            href={partner.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105"
          >
            {partner.logo ? (
              <img src={partner.logo} alt={partner.name} className="h-8 md:h-10 w-auto" />
            ) : (
              <span className="text-lg font-bold text-text-muted">{partner.name}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
