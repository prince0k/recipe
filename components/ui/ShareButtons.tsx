'use client';

import React, { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  image?: string;
  description?: string;
}

export function ShareButtons({ url, title, image, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://stewartlucas.com';
  const fullUrl = `${baseUrl}${url}`;

  const shares = [
    {
      name: 'Pinterest',
      color: 'bg-[#E60023] hover:bg-[#c8001e]',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&media=${encodeURIComponent(image ?? '')}&description=${encodeURIComponent(title)}`,
      icon: '📌',
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#1565c0]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      icon: '👍',
    },
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#1ebe57]',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`,
      icon: '💬',
    },
  ];

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Share Recipe:</span>
      
      {shares.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${s.color} hover:-translate-y-0.5 active:translate-y-0`}
          aria-label={`Share on ${s.name}`}
        >
          <span>{s.icon}</span>
          <span>{s.name}</span>
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-border cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
          copied 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
            : 'bg-white text-text hover:bg-surface'
        }`}
        aria-label="Copy recipe link"
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
