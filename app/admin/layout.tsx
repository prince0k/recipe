import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export const metadata = {
  title: "Admin | NutriGuide",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <AdminSidebar />
      </div>
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
