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
    { name: "Cheat Sheets", href: "/cheat-sheets" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-serif text-2xl font-bold text-[#10b981]">NutriGuide</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "border-[#10b981] text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
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
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#10b981]"
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === link.href
                    ? "bg-green-50 border-[#10b981] text-[#10b981]"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200 px-4 space-y-2">
              {session ? (
                <>
                  <div className="text-base font-medium text-gray-800 mb-2 px-2">
                    Signed in as {session.user?.email}
                  </div>
                  {session.user?.role === "ADMIN" && (
                    <Link href="/admin" className="block text-center w-full bg-gray-100 py-2 rounded-md text-gray-700 font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block text-center w-full text-red-600 border border-red-200 py-2 rounded-md font-medium"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-center w-full bg-gray-50 py-2 rounded-md text-gray-700 font-medium border border-gray-200">
                    Log in
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" className="w-full">Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
