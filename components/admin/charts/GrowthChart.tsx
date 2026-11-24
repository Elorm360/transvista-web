"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { GrowthPoint } from "@/lib/dashboard/getAnalytics";

interface GrowthChartProps {
  data: GrowthPoint[];
}

/**
 * GrowthChart
 *
 * Line chart showing how many members joined per day over the
 * selected window. Renders an empty state when there's no data.
 */
export default function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState message="No growth data yet." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-slate-500)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-slate-200)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--color-slate-500)" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--color-slate-200)",
              backgroundColor: "var(--admin-surface, #ffffff)",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ fontWeight: 600, color: "var(--color-slate-900)" }}
            formatter={(value) => [`${value} joined`, "Members"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-brand-blue-600)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Simple centered empty state used by charts. */
function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
