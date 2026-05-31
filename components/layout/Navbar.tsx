"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";
// Note: In NextAuth v5, useSession needs SessionProvider, or we can fetch session server-side 
// and pass it as a prop. For simplicity, we'll assume it's passed as a prop or we use a basic client state if needed.
// We will update this to use `next-auth/react` once SessionProvider is wrapped in layout.

import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Recipes", href: "/recipes" },
    { name: "Diet Plans", href: "/diet-plan" },
    { name: "AI Meal Planner", href: "/personalized" },
    { name: "Cheat Sheets", href: "/cheat-sheets" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="font-serif text-2xl md:text-3xl font-bold text-primary group-hover:text-secondary transition-colors flex flex-col line-tight">
                NutriGuide 
                <span className="text-xs md:text-sm font-medium opacity-80 italic -mt-1 tracking-wide">by Stewart Lucas</span>
              </span>
            </Link>
            <div className="hidden lg:flex lg:space-x-8 lg:ml-10">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? "text-primary border-b-2 border-primary"
                      : "text-text-muted hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6 ml-auto mr-4 lg:mr-0 lg:ml-6">
            <Link href="/favorites" className="text-text-muted hover:text-primary p-2 rounded-full hover:bg-surface transition-colors" aria-label="Favorites">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <>
                {session.user?.role === "ADMIN" && (
                  <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Admin
                  </Link>
                )}
                <div className="text-sm font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-full">
                  {session.user?.name || session.user?.email}
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-500 hover:text-red-600 text-sm font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                  Log in
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#10b981]"
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-surface shadow-lg border-b border-border">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-transparent text-text-muted hover:bg-white hover:border-border hover:text-text"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
