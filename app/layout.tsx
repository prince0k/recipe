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
  title: "NutriGuide - Science-Backed Diet Plans & Recipes",
  description: "Transform your health with free, science-backed diet plans, cheat sheets, and recipes designed for real results.",
  keywords: "diet plan, healthy recipes, weight loss, PCOS diet, diabetes diet, meal planning",
  openGraph: {
    title: "NutriGuide - Science-Backed Diet Plans & Recipes",
    description: "Transform your health with free, science-backed diet plans and recipes.",
    type: "website",
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
import { ChatWidget } from "@/components/ui/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6909933688780427"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <SessionProvider>
          <SignupTracker />
          <ChatWidget />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
