import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import { PinterestDashboardClient } from "./PinterestDashboardClient";
import { Card, CardContent } from "@/components/ui/Card";
import { Clock, CheckCircle, Calendar, ExternalLink, ShieldCheck, Pin, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PinterestDashboard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  // 1. Fetch Stats
  const pendingIdeasCount = await prisma.pinterestIdea.count({
    where: { status: "PENDING" }
  });

  const draftPinsCount = await prisma.pinterestPin.count({
    where: { status: "DRAFT" }
  });

  const scheduledPinsCount = await prisma.pinterestPin.count({
    where: { status: "SCHEDULED" }
  });

  const postedPinsCount = await prisma.pinterestPin.count({
    where: { status: "POSTED" }
  });

  // 2. Fetch Scheduled Pins
  const scheduledPins = await prisma.pinterestPin.findMany({
    where: { status: "SCHEDULED" },
    include: { content: true },
    orderBy: { scheduledAt: "asc" }
  });

  // 3. Fetch History (Recent 10)
  const postedPins = await prisma.pinterestPin.findMany({
    where: { status: "POSTED" },
    include: { content: true },
    orderBy: { postedAt: "desc" },
    take: 10
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e60023]/10 text-[#e60023] flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinterest Automation
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-serif">Pinterest Poster</h1>
          <p className="text-gray-500 mt-1">Manage Gemini idea brainstorming, visual Pin text overlays, and scheduling queue.</p>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:shadow-md transition-all border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ideas to Review</span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900">{pendingIdeasCount}</p>
              <p className="text-xs text-gray-500 mt-1">Brainstormed by Gemini</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-l-4 border-l-blue-500">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unapproved Drafts</span>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900">{draftPinsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Generated posts & graphics</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-l-4 border-l-[#10b981]">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Queue</span>
              <div className="p-2 bg-[#10b981]/10 rounded-lg text-[#10b981]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900">{scheduledPinsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting automatic post</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-l-4 border-l-[#e60023]">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pins Posted</span>
              <div className="p-2 bg-[#e60023]/10 rounded-lg text-[#e60023]">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900">{postedPinsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Published on Pinterest</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Client Component */}
      <PinterestDashboardClient 
        pendingIdeasCount={pendingIdeasCount} 
        draftPinsCount={draftPinsCount} 
      />

      {/* Scheduling Queue Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-serif">Scheduled Pinning Queue</h2>
            <p className="text-sm text-gray-500 mt-1">These pins are scheduled for release at peak engagement hours.</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-[#10b981]/15 text-[#10b981] rounded-full">
            {scheduledPins.length} Pin(s) Pending
          </span>
        </div>

        {scheduledPins.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-slate-500">No upcoming pins scheduled. Generate ideas and approve drafts to populate the queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase bg-gray-50/30">
                  <th className="px-6 py-4">Graphic</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Pinterest Board</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {scheduledPins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          src={pin.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"} 
                          alt={pin.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <h4 className="font-bold text-gray-900 leading-tight">{pin.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pin.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Overlay: "{pin.textOverlay}"
                        </span>
                        {pin.content && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> {pin.content.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {pin.boardName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(pin.scheduledAt!).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        pin.isNew 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {pin.isNew ? "Fresh Post" : "Evergreen Mix"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 font-serif">Recently Posted History</h2>
          <p className="text-sm text-gray-500 mt-1">Logs of pins that have successfully posted to your Pinterest boards.</p>
        </div>

        {postedPins.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-slate-500">No pins posted yet. Run the scheduler or click approve with --now to post instantly.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase bg-gray-50/30">
                  <th className="px-6 py-4">Graphic</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Board</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {postedPins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img 
                          src={pin.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"} 
                          alt={pin.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <h4 className="font-bold text-gray-900 leading-tight">{pin.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pin.description}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {pin.boardName}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(pin.postedAt!).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {pin.pinUrl ? (
                        <a 
                          href={pin.pinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#e60023] hover:underline font-semibold text-xs cursor-pointer"
                        >
                          View Pin <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
