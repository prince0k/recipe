import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminMobileNav } from "@/components/layout/AdminMobileNav";

export const metadata = {
  title: "Admin | NutriGuide",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 animate-fade-in">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <AdminMobileNav />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
