import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import { PinterestApproveClient } from "./PinterestApproveClient";
import { Pin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PinterestApprovePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  // Fetch all draft pins awaiting approval
  const draftPins = await prisma.pinterestPin.findMany({
    where: {
      status: "DRAFT"
    },
    include: {
      content: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/admin/pinterest" 
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-serif flex items-center gap-3 mt-1">
            <Pin className="w-8 h-8 text-[#e60023]" /> Review Graphics & Articles
          </h1>
          <p className="text-gray-500 mt-1">
            Confirm the visual layout, text overlay tags, and article contents drafted by Gemini before scheduled release.
          </p>
        </div>
      </div>

      {/* Main Interactive Client Grid */}
      <PinterestApproveClient initialPins={draftPins} />
    </div>
  );
}
