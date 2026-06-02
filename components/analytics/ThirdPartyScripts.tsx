"use client";

import { useEffect, useState } from "react";

export function ThirdPartyScripts() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    let loaded = false;

    const loadScripts = () => {
      if (loaded) return;
      loaded = true;
      setShouldLoad(true);

      // Clean up event listeners
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);
    };

    // Load after a safe delay if no user interaction occurs
    const timeoutId = setTimeout(loadScripts, 3500);

    window.addEventListener("scroll", loadScripts, { passive: true });
    window.addEventListener("mousemove", loadScripts, { passive: true });
    window.addEventListener("touchstart", loadScripts, { passive: true });
    window.addEventListener("keydown", loadScripts, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", loadScripts);
      window.removeEventListener("mousemove", loadScripts);
      window.removeEventListener("touchstart", loadScripts);
      window.removeEventListener("keydown", loadScripts);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      {/* Google AdSense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6909933688780427"
        crossOrigin="anonymous"
      />
      {/* Google Analytics */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-STTYDWMM79"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-STTYDWMM79', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
