'use client';

interface Props {
  url: string;
  title: string;
  image?: string;
}

export function ShareButtons({ url, title, image }: Props) {
  const fullUrl = `https://stewartlucas.com${url}`;

  const buttons = [
    {
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&media=${encodeURIComponent(image ?? '')}&description=${encodeURIComponent(title)}`,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}`,
    },
  ];

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    alert('Link copied to clipboard!');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-white/40">Share</span>
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 cursor-pointer"
        >
          {b.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 cursor-pointer"
      >
        Copy Link
      </button>
    </div>
  );
}
