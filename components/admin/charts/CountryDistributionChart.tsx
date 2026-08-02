"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { CountryDistribution } from "@/lib/dashboard/getAnalytics";

interface CountryDistributionChartProps {
  data: CountryDistribution[];
}

/**
 * CountryDistributionChart
 *
 * Horizontal bar chart showing the top countries by member count.
 * Renders an empty state when there's no data.
 */
export default function CountryDistributionChart({
  data,
}: CountryDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">No country data yet.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fontSize: 12, fill: "#475569" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ fontWeight: 600, color: "#0f172a" }}
            formatter={(value) => [`${value} members`, "Members"]}
          />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 4, 4]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
