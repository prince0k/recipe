'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
  image?: string;
  theme?: 'light' | 'dark';
}

export function ShareButtons({ url, title, image, theme = 'dark' }: Props) {
  const fullUrl = `https://stewartlucas.com${url}`;
  const fullImageUrl = image && image.startsWith('/') ? `https://stewartlucas.com${image}` : (image ?? '');
  const isLight = theme === 'light';

  const buttons = [
    {
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&media=${encodeURIComponent(fullImageUrl)}&description=${encodeURIComponent(title)}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.76-2.245 3.76-5.488 0-2.868-2.061-4.869-5.004-4.869-3.41 0-5.413 2.561-5.413 5.204 0 1.03.399 2.137.899 2.742.098.12.112.223.083.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.256-.4.149-1.492-.697-2.428-2.882-2.428-4.634 0-3.77 2.739-7.234 7.906-7.234 4.15 0 7.373 2.957 7.373 6.9 0 4.124-2.6 7.447-6.206 7.447-1.213 0-2.354-.63-2.744-1.371l-.748 2.852c-.271 1.043-1.008 2.35-1.5 3.146 1.122.348 2.309.537 3.54.537 6.623 0 11.99-5.372 11.99-11.993C23.99 5.367 18.623 0 12.017 0z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#bd081c]/10 hover:border-[#bd081c] hover:text-[#bd081c]',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#1877f2]/10 hover:border-[#1877f2] hover:text-[#1877f2]',
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.452 4.893 1.453 5.487.002 9.95-4.456 9.954-9.943.002-2.66-1.019-5.16-2.87-7.013C16.716 1.8 14.216.788 11.56.788c-5.49 0-9.952 4.457-9.956 9.944-.002 2.01.527 3.976 1.536 5.725l-.993 3.633 3.73-.978zm13.14-8.812c-.287-.144-1.702-.84-1.968-.936-.264-.096-.456-.144-.648.144-.19.288-.74.936-.908 1.128-.168.19-.336.216-.624.072-.288-.144-1.216-.448-2.316-1.43-.856-.764-1.436-1.708-1.604-1.996-.168-.288-.018-.444.126-.587.13-.13.288-.336.432-.504.144-.168.192-.288.288-.48.096-.192.048-.36-.024-.504-.072-.144-.648-1.56-.888-2.136-.234-.564-.492-.486-.672-.496-.172-.01-.37-.012-.566-.012-.196 0-.514.074-.784.364-.268.288-1.026 1.008-1.026 2.46 0 1.452 1.056 2.856 1.2 3.048.144.192 2.078 3.174 5.034 4.452.704.304 1.254.486 1.682.622.708.226 1.352.194 1.86.118.566-.084 1.702-.696 1.942-1.37.24-.672.24-1.248.168-1.37-.072-.12-.264-.216-.552-.36z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#25d366]/10 hover:border-[#25d366] hover:text-[#25d366]',
    },
  ];

  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const labelClass = isLight ? "text-xs uppercase tracking-wider font-bold text-muted-foreground/60" : "text-xs uppercase tracking-wider font-bold text-white/40";
  const btnBaseClass = isLight ? "border-border text-foreground/70" : "border-white/10 text-white/70";
  const copyBtnHoverClass = isLight ? "hover:bg-foreground/5 hover:border-foreground/20 hover:text-foreground" : "hover:bg-white/10 hover:border-white/30 hover:text-white";
  const copiedClass = isLight ? "bg-green-500/10 border-green-500 text-green-600" : "bg-green-500/10 border-green-500 text-green-500";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={labelClass}>Share:</span>
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          title={b.label}
          aria-label={b.label}
          className={`w-10 h-10 flex items-center justify-center border transition duration-300 cursor-pointer rounded-lg ${btnBaseClass} ${b.hoverClass}`}
        >
          {b.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        title={copied ? 'Link Copied!' : 'Copy Link'}
        aria-label={copied ? 'Link Copied!' : 'Copy Link'}
        className={`w-10 h-10 flex items-center justify-center border transition duration-300 cursor-pointer rounded-lg ${
          copied 
            ? copiedClass 
            : `${btnBaseClass} ${copyBtnHoverClass}`
        }`}
      >
        {copied ? (
          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        )}
      </button>
    </div>
  );
}
