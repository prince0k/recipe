import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import SessionProvider from "@/components/auth/SessionProvider";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stewartlucas.com'),
  title: {
    default: 'NutriGuide by Stewart Lucas — Free Diet Plans & Healthy Recipes',
    template: '%s | NutriGuide by Stewart Lucas',
  },
  description: 'Free science-backed diet plans, healthy recipes, and meal prep guides from NutriGuide by Stewart Lucas.',
  keywords: ['diet plan', 'healthy recipes', 'meal prep', 'weight loss', 'keto', 'gluten free', 'high protein', 'Stewart Lucas'],
  authors: [{ name: 'Stewart Lucas', url: 'https://stewartlucas.com/about' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stewartlucas.com',
    siteName: 'NutriGuide by Stewart Lucas',
    title: 'NutriGuide by Stewart Lucas — Free Diet Plans & Healthy Recipes',
    description: 'Free science-backed diet plans, healthy recipes, and meal prep guides.',
    images: [
      {
        url: 'https://stewartlucas.com/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NutriGuide by Stewart Lucas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stewartlucas',
    creator: '@stewartlucas',
    title: 'NutriGuide by Stewart Lucas',
    description: 'Free science-backed diet plans and healthy recipes.',
    images: ['https://stewartlucas.com/assets/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    "google-adsense-account": "ca-pub-6909933688780427",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

import { SignupTracker } from "@/components/ui/SignupTracker";
import { BotpressChat } from "@/components/ui/BotpressChatWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} bg-background`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6909933688780427"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-STTYDWMM79"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-STTYDWMM79');
          `}
        </Script>
        <SessionProvider>
          <SignupTracker />
          <BotpressChat />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
