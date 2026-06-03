'use client';

import React, { useState } from 'react';

interface EmailCaptureFormProps {
  source?: string;          // where on site (e.g. 'homepage', 'cheatsheet')
  heading?: string;
  subheading?: string;
  buttonText?: string;
  freebie?: string;         // name of the lead magnet or slug
  variant?: 'dark' | 'light';
}

export function EmailCaptureForm({
  source = 'homepage',
  heading = 'Get Your Free 7-Day Meal Plan',
  subheading = 'Join thousands getting science-backed recipes every week. No spam, ever.',
  buttonText = 'Send My Free Plan →',
  freebie = '7-day-meal-plan',
  variant = 'dark',
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
        setMessage('Subscription successful! Preparing your download...');
        setEmail('');
        if (source === 'cheatsheet') {
          setTimeout(() => {
            window.print();
          }, 800);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  const isLight = variant === 'light';

  // Containers
  const containerClasses = isLight 
    ? 'w-full max-w-xl mx-auto rounded-2xl border border-black/10 bg-black/[0.02] p-6 md:p-8'
    : 'w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8';

  // Typography
  const headingClasses = isLight ? 'mb-2 text-xl font-semibold text-text' : 'mb-2 text-xl font-semibold text-white';
  const subheadingClasses = isLight ? 'mb-5 text-sm text-text-muted' : 'mb-5 text-sm text-white/60';
  const successClasses = isLight ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-green-400';
  const errorClasses = isLight ? 'mt-2 text-xs text-red-600' : 'mt-2 text-xs text-red-400';
  const footerClasses = isLight ? 'mt-3 text-xs text-text-muted/60' : 'mt-3 text-xs text-white/30';

  // Input
  const inputClasses = isLight
    ? 'flex-1 rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-text placeholder-black/40 focus:border-black/50 focus:outline-none'
    : 'flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white/50 focus:outline-none';

  // Button
  const buttonClasses = isLight
    ? 'whitespace-nowrap rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer'
    : 'whitespace-nowrap rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 cursor-pointer';

  return (
    <div className={containerClasses}>
      <h3 className={headingClasses}>{heading}</h3>
      <p className={subheadingClasses}>{subheading}</p>

      {status === 'success' ? (
        <p className={successClasses}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={inputClasses}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={buttonClasses}
          >
            {status === 'loading' ? 'Sending...' : buttonText}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className={errorClasses}>{message}</p>
      )}

      <p className={footerClasses}>No spam. Unsubscribe anytime.</p>
    </div>
  );
}
