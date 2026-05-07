"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function SubscribePopup() {
  const { status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // Check if the user is already logged in, has already subscribed or dismissed the popup
    if (status === "authenticated") return;
    
    const hasSeen = localStorage.getItem("stwart_lucas_popup_dismissed");
    if (hasSeen) return;

    let fallbackTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight
      );
      
      const scrollable = documentHeight - windowHeight;
      
      // If page is not scrollable, or user scrolled >= 20%
      if (scrollable <= 0 || ((scrollPosition / scrollable) * 100) >= 20) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll);
        if (fallbackTimer) clearTimeout(fallbackTimer);
      }
    };

    fallbackTimer = setTimeout(() => {
      setIsVisible(true);
      window.removeEventListener("scroll", handleScroll);
    }, 10000); // 10 seconds fallback

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check immediately in case it's a very short page
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [status]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("stwart_lucas_popup_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          // Client-side metadata for subscriber intelligence
          referrer: document.referrer || null,
          pageUrl: window.location.href,
          screenRes: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        }),
      });

      if (res.ok) {
        setFormStatus("success");
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setFormStatus("error");
      }
    } catch (error) {
      setFormStatus("error");
    }
  };

  if (!isVisible || status === "authenticated") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">Join Our Community</h2>
          <p className="text-gray-600 text-sm">
            Subscribe for exclusive recipes, personalized diet plans, and expert nutritional advice delivered straight to your inbox.
          </p>
        </div>

        {formStatus === "success" ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center font-medium">
            Thank you for subscribing! Welcome to the family.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">First Name</label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your First Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                suppressHydrationWarning
              />
            </div>
            <button
              type="submit"
              disabled={formStatus === "loading"}
              className="w-full bg-amber-600 text-white font-medium py-3 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formStatus === "loading" ? "Subscribing..." : "Subscribe Now"}
            </button>
            {formStatus === "error" && (
              <p className="text-red-500 text-xs text-center mt-2">Failed to subscribe. Please try again.</p>
            )}
            <p className="text-xs text-gray-400 text-center mt-4">
              By subscribing, you agree to our{" "}
              <a href="/privacy-policy" target="_blank" className="underline hover:text-gray-600 transition-colors">
                Privacy Policy
              </a>. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
