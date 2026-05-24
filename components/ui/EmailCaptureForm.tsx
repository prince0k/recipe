'use client';

import React, { useState } from 'react';

interface EmailCaptureFormProps {
  source?: string;          // where on site (e.g. 'homepage', 'cheatsheet')
  heading?: string;
  subheading?: string;
  buttonText?: string;
  freebie?: string;         // name of the lead magnet or slug
}

export function EmailCaptureForm({
  source = 'homepage',
  heading = 'Get Your Free 7-Day Meal Plan',
  subheading = 'Join 10,000+ subscribers. Science-backed recipes, straight to your inbox.',
  buttonText = 'Send My Free Plan →',
  freebie = '7-day-meal-plan',
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      // Map properties to match existing /api/subscribe schema:
      // - source -> referrer
      // - freebie -> pageUrl
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name: '',
          referrer: source,
          pageUrl: freebie,
          screenRes: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
          language: typeof navigator !== 'undefined' ? navigator.language : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Check your inbox! Your free plan is on its way. 🎉');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
      <h3 className="text-2xl font-bold font-serif text-white mb-2">{heading}</h3>
      <p className="text-sm text-white/60 mb-6 font-serif italic">{subheading}</p>

      {status === 'success' ? (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400">
          <p className="text-sm font-bold text-center">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-grow px-5 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition duration-200 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-98"
          >
            {status === 'loading' ? 'Sending...' : buttonText}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-xs mt-3 font-semibold text-center">{message}</p>
      )}

      <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mt-4 text-center">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
