"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { InterestBreakdown } from "@/lib/dashboard/getAnalytics";

interface InterestBreakdownChartProps {
  data: InterestBreakdown[];
}

// Calm, premium palette consistent with the site's design system.
const COLORS = [
  "#2563eb", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#f43f5e", // rose
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
  "#64748b", // slate
];

/**
 * InterestBreakdownChart
 *
 * Donut chart showing the distribution of members by interest.
 * Renders an empty state when there's no data.
 */
export default function InterestBreakdownChart({
  data,
}: InterestBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">No interest data yet.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="interest"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ fontWeight: 600, color: "#0f172a" }}
            formatter={(value, name) => [`${value} members`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((item, index) => (
          <div key={item.interest} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate text-slate-600">{item.interest}</span>
            <span className="ml-auto font-medium text-slate-900">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
