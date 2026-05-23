"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LogOut } from "lucide-react";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "AI Requests", href: "/admin/requests", icon: "✨" },
    { name: "Leads & Users", href: "/admin/leads", icon: "👥" },
    { name: "Subscribers", href: "/admin/subscribers", icon: "📬" },
    { name: "Content", href: "/admin/content", icon: "📝" },
    { name: "AI Content Gen", href: "/admin/content/ai-generator", icon: "✨" },
    { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    { name: "Partners", href: "/admin/partners", icon: "🤝" },
    { name: "Ads Manager", href: "/admin/ads", icon: "📢" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  ];

  return (
    <div className="md:hidden">
      {/* Top Mobile Bar */}
      <div className="h-16 bg-slate-900 flex items-center justify-between px-6 border-b border-slate-800 text-white w-full sticky top-0 z-40">
        <span className="text-lg font-bold font-serif text-[#10b981]">NutriGuide Admin</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-300 hover:text-white focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative flex flex-col w-full max-w-xs bg-slate-950 text-white h-full z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900">
              <span className="text-lg font-bold font-serif text-[#10b981]">NutriGuide Admin</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      isActive ? "bg-[#10b981] text-white" : "text-gray-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-900">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
