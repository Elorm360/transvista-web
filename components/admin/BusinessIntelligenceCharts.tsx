"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import type { BusinessBarPoint, BusinessTrendPoint } from "@/lib/dashboard/getBusinessIntelligence";

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

export function BookingTrendChart({ data }: { data: BusinessTrendPoint[] }) {
  if (!data.length) return <Empty message="No booking activity in this period." />;
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval="preserveStartEnd" />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={28} />
      <Tooltip contentStyle={tooltipStyle} />
      <Line type="monotone" dataKey="bookings" name="Requests" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#f47b20" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer></div>;
}

export function BusinessBarChart({ data, emptyMessage = "No records to display." }: { data: BusinessBarPoint[]; emptyMessage?: string }) {
  if (!data.length) return <Empty message={emptyMessage} />;
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="label" width={128} tick={{ fontSize: 11, fill: "#475569" }} tickLine={false} axisLine={false} />
      <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={tooltipStyle} />
      <Bar dataKey="value" name="Bookings" fill="#2563eb" radius={[0, 5, 5, 0]} barSize={18}>
        {data.map((_, index) => <Cell key={index} fill={index === 0 ? "#f47b20" : "#2563eb"} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer></div>;
}

function Empty({ message }: { message: string }) {
  return <div className="flex h-72 items-center justify-center"><p className="text-sm text-slate-400">{message}</p></div>;
}
