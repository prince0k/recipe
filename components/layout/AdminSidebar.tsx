"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "AI Requests", href: "/admin/requests", icon: "✨" },
    { name: "Leads & Users", href: "/admin/leads", icon: "👥" },
    { name: "Subscribers", href: "/admin/subscribers", icon: "📬" },
    { name: "Content", href: "/admin/content", icon: "📝" },
    { name: "AI Content Gen", href: "/admin/content/ai-generator", icon: "✨" },
    { name: "Pinterest Poster", href: "/admin/pinterest", icon: "📌" },
    { name: "Categories", href: "/admin/categories", icon: "🗂️" },
    { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    { name: "Partners", href: "/admin/partners", icon: "🤝" },
    { name: "Ads Manager", href: "/admin/ads", icon: "📢" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  ];

  return (
    <div className="w-64 bg-slate-900 h-full min-h-screen text-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold font-serif text-[#10b981]">NutriGuide Admin</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-[#10b981] text-white" : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          Log out
        </button>
      </div>
    </div>
  );
}
