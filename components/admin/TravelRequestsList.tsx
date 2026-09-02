"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, Inbox, Mail, Phone, Users, X } from "lucide-react";
import type { TravelRequestRecord } from "@/lib/dashboard/getTravelRequests";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TravelRequestsList({
  requests,
}: {
  requests: TravelRequestRecord[];
}) {
  const [selected, setSelected] = useState<TravelRequestRecord | null>(null);
  const newCount = useMemo(
    () =>
      requests.filter((request) =>
        ["new", "pending-review"].includes(request.status),
      ).length,
    [requests],
  );

  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric icon={Inbox} label="All requests" value={requests.length} />
        <Metric icon={CalendarClock} label="New requests" value={newCount} accent />
        <Metric
          icon={Users}
          label="Total travellers"
          value={requests.reduce((total, request) => total + request.travellers, 0)}
        />
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="font-semibold text-slate-900">No travel requests yet</p>
          <p className="mt-2 text-sm text-slate-500">
            New custom-trip and package requests will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Reference", "Traveller", "Request", "People", "Status", "Received", ""].map((label, index) => (
                    <th key={`${label}-${index}`} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr key={request.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-5 py-4 text-sm font-semibold text-blue-700">{request.reference}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">{request.fullName}</p>
                      <a className="mt-1 block text-xs text-blue-600 hover:underline" href={`mailto:${request.email}`}>{request.email}</a>
                      <a className="mt-1 block text-xs text-slate-500 hover:underline" href={`tel:${request.phone}`}>{request.phone}</a>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{request.kind}</p>
                      <p className="mt-1 max-w-xs text-sm text-slate-700">{request.summary}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{request.travellers}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800">
                        {request.status.replaceAll("-", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(request.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(request)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/45"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-detail-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">{selected.kind}</p>
                <h2 id="request-detail-title" className="mt-1 text-xl font-bold text-slate-950">{selected.fullName}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selected.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Close request details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">
                  <Mail className="h-4 w-4" /> {selected.email}
                </a>
                <a href={`tel:${selected.phone}`} className="flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-800">
                  <Phone className="h-4 w-4" /> {selected.phone}
                </a>
              </div>

              <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {selected.details.map((detail) => (
                  <div key={detail.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr]">
                    <dt className="text-sm font-semibold text-slate-500">{detail.label}</dt>
                    <dd className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <Icon className={`h-5 w-5 ${accent ? "text-orange-600" : "text-slate-400"}`} />
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}