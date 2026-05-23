"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface GrowthTrendItem {
  date: string;
  users: number;
  downloads: number;
}

interface ContentDistributionItem {
  name: string;
  value: number;
}

interface SubscriberCountryItem {
  country: string;
  count: number;
}

interface DashboardChartsProps {
  growthTrend: GrowthTrendItem[];
  contentDistribution: ContentDistributionItem[];
  subscribersByCountry: SubscriberCountryItem[];
}

const COLORS = ["#8B0000", "#B35412", "#10b981", "#F4D03F", "#556B2F", "#5D4037"];

export function DashboardCharts({
  growthTrend,
  contentDistribution,
  subscribersByCountry,
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<"trends" | "content" | "subscribers">("trends");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif">Data Visualization</h2>
          <p className="text-sm text-gray-500">Analyze user activities, content growth, and audience demographics.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "trends"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            📈 Growth & Activity
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "content"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            📝 Content Mix
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "subscribers"
                ? "bg-white text-gray-900 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-950"
            }`}
          >
            🌍 Geography
          </button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        {activeTab === "trends" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B35412" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B35412" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
                labelStyle={{ fontWeight: 600, color: "#111827", fontFamily: "var(--font-serif)" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
              <Area
                name="New Signups"
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                name="Downloads"
                type="monotone"
                dataKey="downloads"
                stroke="#B35412"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDownloads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "content" && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 px-4 md:px-12">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">Content Categories</h3>
              {contentDistribution.map((item, index) => {
                const total = contentDistribution.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-700 capitalize">
                        {item.name.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-gray-500 font-semibold">
                      {item.value} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "subscribers" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subscribersByCountry}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B0000" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#B35412" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="country"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              />
              <Bar
                name="Subscribers"
                dataKey="count"
                fill="url(#colorBar)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
