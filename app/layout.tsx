import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import SessionProvider from "@/components/auth/SessionProvider";
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
  title: "NutriGuide by Stewart Lucas - Free Diet Plans & Recipes",
  description: "Download free diet plans, cheat sheets, and recipes to reach your health goals.",
  keywords: "diet plan, healthy recipes, weight loss, PCOS diet, diabetes diet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-text">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
