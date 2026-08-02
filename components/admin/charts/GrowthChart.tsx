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
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            labelStyle={{ fontWeight: 600, color: "#0f172a" }}
            formatter={(value) => [`${value} joined`, "Members"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
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
