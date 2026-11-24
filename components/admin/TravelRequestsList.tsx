"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Download,
  FileText,
  Mail,
  MessageSquareText,
  Phone,
  Save,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  assignSelectedBookings,
  permanentlyDeleteRequest,
  sendBookingPaymentRequest,
  setRequestArchiveState,
  updateBookingOperation,
  type BookingOperationState,
} from "@/app/actions/booking-operations";
import type {
  RequestOperator,
  TravelRequestRecord,
} from "@/lib/dashboard/getTravelRequests";
import { buttonClass, StatusBadge, statusLabel } from "@/components/admin/ui";
import {
  attentionReasons,
  bookingTotals,
  isStalePastTrip,
  needsAttention,
  todayInAccra,
} from "@/lib/admin/bookingHealth";
import TravellerDetailsEditor from "@/components/admin/TravellerDetailsEditor";

const customStatuses = [
  "new",
  "reviewing",
  "contacted",
  "quoted",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
  "closed",
];

const packageStatuses = [
  "pending-review",
  "confirmed-awaiting-deposit",
  "deposit-paid",
  "paid",
  "in-progress",
  "completed",
  "waitlisted",
  "cancelled",
];

const paymentStatuses = [
  "not-requested",
  "payment-requested",
  "deposit-requested",
  "deposit-paid",
  "paid",
  "refunded",
  "partially-refunded",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Accra",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Accra",
  });
}

function datetimeInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function defaultPaymentDeadline(tripDate: string | null) {
  const base = tripDate ? new Date(tripDate + "T12:00:00Z") : new Date();
  if (tripDate) base.setUTCDate(base.getUTCDate() - 14);
  else base.setUTCDate(base.getUTCDate() + 7);
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (base < tomorrow) return tomorrow.toISOString().slice(0, 10);
  return base.toISOString().slice(0, 10);
}

function label(value: string) {
  return value.replaceAll("-", " ");
}

function money(currency: string | null, value: number) {
  return `${currency ?? "GHS"} ${value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}



const SAVED_VIEWS = new Set(["all", "attention", "new", "awaiting-payment", "confirmed", "overdue", "past-open"]);

export default function TravelRequestsList({
  requests,
  operators,
  adminRole,
  initialOpenId,
  initialView,
}: {
  requests: TravelRequestRecord[];
  operators: RequestOperator[];
  adminRole: string;
  /** Open this booking on load (e.g. from an Overview action link). */
  initialOpenId?: string;
  /** Start on this saved view (e.g. "past-open"). */
  initialView?: string;
}) {
  const [selectedSnapshot, setSelected] = useState<TravelRequestRecord | null>(
    () => (initialOpenId ? requests.find((request) => request.id === initialOpenId) ?? null : null),
  );
  // Reference time for "overdue" checks, fixed when the page loads so renders stay pure.
  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [tripDateFrom, setTripDateFrom] = useState("");
  const [tripDateTo, setTripDateTo] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("active");
  const [savedView, setSavedView] = useState(() =>
    initialView && SAVED_VIEWS.has(initialView) ? initialView : "all",
  );
  const [rawSelectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  // Rarely used filters stay folded away until asked for.
  const [showFilters, setShowFilters] = useState(false);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesQuery = !normalizedQuery || [
        request.reference, request.fullName, request.email, request.phone,
        request.summary, request.assigneeName ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesKind = kindFilter === "all" || request.source === kindFilter;
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      const matchesPayment = paymentFilter === "all" || request.paymentStatus === paymentFilter;
      const matchesAssignee = assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" ? !request.assignedTo : request.assignedTo === assigneeFilter);
      const matchesTripDate = (!tripDateFrom || Boolean(request.tripDate && request.tripDate >= tripDateFrom)) &&
        (!tripDateTo || Boolean(request.tripDate && request.tripDate <= tripDateTo));
      const matchesVisibility = visibilityFilter === "all" ||
        (visibilityFilter === "archived" ? Boolean(request.archivedAt) : !request.archivedAt);
      const matchesSavedView =
        savedView === "all" ||
        (savedView === "new" && ["new", "pending-review"].includes(request.status)) ||
        (savedView === "awaiting-payment" && !["cancelled", "closed", "completed"].includes(request.status) &&
          ["not-requested", "payment-requested", "deposit-requested"].includes(request.paymentStatus)) ||
        (savedView === "confirmed" && ["confirmed", "confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress"].includes(request.status)) ||
        (savedView === "attention" && needsAttention(request, new Date(now))) ||
        (savedView === "overdue" && attentionReasons(request, new Date(now)).includes("follow-up-overdue")) ||
        (savedView === "past-open" && isStalePastTrip(request, todayInAccra(new Date(now))));
      return matchesQuery && matchesKind && matchesStatus && matchesPriority && matchesPayment &&
        matchesAssignee && matchesTripDate && matchesVisibility && matchesSavedView;
    });
  }, [assigneeFilter, kindFilter, paymentFilter, priorityFilter, query, requests, now, savedView, statusFilter, tripDateFrom, tripDateTo, visibilityFilter]);

  // Only rows still visible under the current filters count as selected.
  const selectedIds = useMemo(() => {
    const visibleIds = new Set(filteredRequests.map((request) => request.id));
    return rawSelectedIds.filter((id) => visibleIds.has(id));
  }, [filteredRequests, rawSelectedIds]);

  // Same rules as the Overview (lib/admin/bookingHealth), so the numbers always match.
  const totals = useMemo(() => bookingTotals(requests, new Date(now)), [requests, now]);

  // Always show the latest copy of the open request after a refresh.
  const selected = useMemo(
    () =>
      selectedSnapshot
        ? requests.find((request) => request.id === selectedSnapshot.id) ?? selectedSnapshot
        : null,
    [requests, selectedSnapshot],
  );

  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  function exportCsv() {
    const headings = [
      "Reference",
      "Type",
      "Traveller",
      "Email",
      "Phone",
      "Travellers",
      "Status",
      "Priority",
      "Assigned to",
      "Payment status",
      "Amount paid",
      "Currency",
      "Follow-up",
      "Received",
    ];
    const rows = filteredRequests.map((request) => [
      request.reference,
      request.kind,
      request.fullName,
      request.email,
      request.phone,
      String(request.travellers),
      label(request.status),
      request.priority,
      request.assigneeName ?? "Unassigned",
      label(request.paymentStatus),
      String(request.amountPaid),
      request.quoteCurrency ?? "GHS",
      request.followUpAt ?? "",
      request.createdAt,
    ]);
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [headings, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `transvista-booking-operations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeFilterCount = [
    kindFilter !== "all",
    statusFilter !== "all",
    paymentFilter !== "all",
    priorityFilter !== "all",
    assigneeFilter !== "all",
    Boolean(tripDateFrom),
    Boolean(tripDateTo),
    visibilityFilter !== "active",
  ].filter(Boolean).length;

  function clearFilters() {
    setQuery(""); setKindFilter("all"); setStatusFilter("all"); setPriorityFilter("all"); setPaymentFilter("all");
    setAssigneeFilter("all"); setTripDateFrom(""); setTripDateTo(""); setVisibilityFilter("active"); setSavedView("all");
  }

  const views: Array<readonly [string, string, number]> = [
    ["all", "All", totals.active],
    ["attention", "Needs attention", totals.needsAttention],
    ["new", "New", requests.filter((r) => !r.archivedAt && ["new", "pending-review"].includes(r.status)).length],
    ["awaiting-payment", "Awaiting payment", requests.filter((r) => !r.archivedAt && !["cancelled", "closed", "completed"].includes(r.status) && ["not-requested", "payment-requested", "deposit-requested"].includes(r.paymentStatus)).length],
    ["confirmed", "Confirmed", requests.filter((r) => !r.archivedAt && ["confirmed", "confirmed-awaiting-deposit", "deposit-paid", "paid", "in-progress"].includes(r.status)).length],
    ["overdue", "Overdue follow-ups", requests.filter((r) => attentionReasons(r, new Date(now)).includes("follow-up-overdue")).length],
    ...(totals.stalePastTrips ? [["past-open", "Past trips still open", totals.stalePastTrips] as const] : []),
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search bookings</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, email, reference or destination"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowFilters((open) => !open)} aria-expanded={showFilters} aria-controls="booking-filters"
            className={buttonClass(activeFilterCount ? "primary" : "secondary", "h-10")}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
          <button type="button" onClick={exportCsv} disabled={!filteredRequests.length} className={buttonClass("secondary", "h-10")}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div id="booking-filters" className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Request type" value={kindFilter} onChange={setKindFilter}
              options={[["all", "All request types"], ["custom", "Custom trips"], ["package", "Group trips"]]} />
            <FilterSelect label="Booking status" value={statusFilter} onChange={setStatusFilter}
              options={[["all", "All statuses"], ...Array.from(new Set(requests.map((r) => r.status))).sort().map((s) => [s, label(s)] as [string, string])]} />
            <FilterSelect label="Payment status" value={paymentFilter} onChange={setPaymentFilter}
              options={[["all", "All payment statuses"], ...Array.from(new Set(requests.map((r) => r.paymentStatus))).sort().map((s) => [s, label(s)] as [string, string])]} />
            <FilterSelect label="Assigned to" value={assigneeFilter} onChange={setAssigneeFilter}
              options={[["all", "Anyone"], ["unassigned", "Unassigned"], ...operators.map((o) => [o.id, o.fullName] as [string, string])]} />
            <FilterSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter}
              options={[["all", "All priorities"], ["urgent", "Urgent"], ["high", "High"], ["normal", "Normal"], ["low", "Low"]]} />
            <label><span className="mb-1 block text-xs font-medium text-slate-600">Trip date from</span>
              <input type="date" value={tripDateFrom} onChange={(event) => setTripDateFrom(event.target.value)} className={inputClass} /></label>
            <label><span className="mb-1 block text-xs font-medium text-slate-600">Trip date to</span>
              <input type="date" value={tripDateTo} onChange={(event) => setTripDateTo(event.target.value)} className={inputClass} /></label>
            <FilterSelect label="Show" value={visibilityFilter} onChange={setVisibilityFilter}
              options={[["active", "Active bookings"], ["archived", "Archived only"], ["all", "Active and archived"]]} />
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={clearFilters} className={buttonClass("ghost")}>Clear all filters</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none]" role="tablist" aria-label="Booking views">
        {views.map(([value, title, count]) => {
          const active = savedView === value;
          return (
            <button key={value} type="button" role="tab" aria-selected={active} onClick={() => setSavedView(value)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${active ? "border-brand-blue-600 text-brand-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {title}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-brand-blue-50 text-brand-blue-700" : "bg-slate-100 text-slate-500"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue-200 bg-brand-blue-50 px-4 py-3">
          <span className="text-sm font-semibold text-brand-blue-900">{selectedIds.length} selected</span>
          <select value={bulkAssignee} onChange={(event) => setBulkAssignee(event.target.value)} required aria-label="Assign selected bookings to"
            className="h-9 min-w-[220px] rounded-lg border border-brand-blue-200 bg-white px-3 text-sm">
            <option value="">Assign to team member…</option>
            {operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.fullName} · {label(operator.role)}</option>)}
          </select>
          <button type="button" disabled={!bulkAssignee} onClick={async () => {
            setBulkMessage("");
            const result = await assignSelectedBookings({ ids: selectedIds, assignedTo: bulkAssignee });
            setBulkMessage(result.message);
            if (result.success) { setSelectedIds([]); setBulkAssignee(""); }
          }} className={buttonClass("primary", "h-9")}>Assign</button>
          <button type="button" onClick={() => setSelectedIds([])} className={buttonClass("ghost", "h-9")}>Clear selection</button>
          {bulkMessage && <span aria-live="polite" className="w-full text-sm font-medium text-brand-blue-900">{bulkMessage}</span>}
        </div>
      )}

      {requests.length === 0 ? (
        <EmptyMessage
          title="No bookings yet"
          body="New custom trip requests and group-trip bookings will appear here."
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyMessage
          title="No bookings match"
          body="Try another view, or clear the search and filters."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="w-10 px-4 py-3"><span className="sr-only">Select</span></th>
                  {["Traveller", "Booking", "Trip date", "Status", "Payment", "Assigned", "Follow-up"].map((heading) => (
                    <th key={heading} className="px-3 py-3 text-xs font-semibold text-slate-500">{heading}</th>
                  ))}
                  <th className="w-10 px-3 py-3"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr key={request.id} onClick={() => setSelected(request)} className="cursor-pointer transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${request.reference}`} checked={selectedIds.includes(request.id)}
                        onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, request.id] : current.filter((id) => id !== request.id))}
                        className="h-4 w-4 rounded border-slate-300 text-brand-blue-600 focus:ring-brand-blue-600" />
                    </td>
                    <td className="min-w-[170px] px-3 py-3">
                      {/* The name is the keyboard-accessible way to open the booking. */}
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(request); }}
                        className="text-left text-sm font-medium text-slate-900 hover:text-brand-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600">
                        {request.fullName}
                      </button>
                      <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{request.reference}{request.archivedAt ? " · Archived" : ""}</p>
                    </td>
                    <td className="max-w-[220px] px-3 py-3">
                      <p className="truncate text-sm text-slate-700" title={request.summary}>{request.summary}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {request.source === "package" ? "Group trip" : "Custom trip"} · {request.travellers} {request.travellers === 1 ? "traveller" : "travellers"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600">{request.tripDate ? formatDate(request.tripDate) : "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={request.status} />
                        {["urgent", "high"].includes(request.priority) && <StatusBadge status="failed" label={label(request.priority)} />}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <p className="text-sm text-slate-700">{statusLabel(request.paymentStatus)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{money(request.quoteCurrency, request.amountPaid)} received</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">{request.assigneeName ?? <span className="text-brand-orange-800">Unassigned</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-600" title={request.followUpAt ? formatDateTime(request.followUpAt) : undefined}>{request.followUpAt ? formatDate(request.followUpAt) : "—"}</td>
                    <td className="px-3 py-3 text-right text-slate-400"><ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {selected && (
        <RequestDrawer
          key={selected.id}
          request={selected}
          operators={operators}
          adminRole={adminRole}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

type DrawerTab = "details" | "manage" | "payment" | "activity";

function RequestDrawer({
  request,
  operators,
  adminRole,
  onClose,
}: {
  request: TravelRequestRecord;
  operators: RequestOperator[];
  adminRole: string;
  onClose: () => void;
}) {
  const archived = Boolean(request.archivedAt);
  const [tab, setTab] = useState<DrawerTab>("details");
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard: focus the panel on open, close with Escape.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tabs: Array<[DrawerTab, string]> = archived
    ? [["details", "Details"], ["activity", "Activity"]]
    : [["details", "Details"], ["manage", "Manage"], ["payment", "Payment"], ["activity", "Activity"]];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-detail-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl">
        <div className="border-b border-slate-200 bg-white px-6 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                {request.source === "package" ? "Group trip" : "Custom trip"} · {request.reference}
              </p>
              <h2 id="request-detail-title" className="mt-1 truncate text-xl font-semibold text-slate-900">
                {request.fullName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={request.status} />
                {archived && <StatusBadge status="archived" />}
                {["urgent", "high"].includes(request.priority) && <StatusBadge status="failed" label={`${label(request.priority)} priority`} />}
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600"
              aria-label="Close booking"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <a href={`mailto:${request.email}`} className="inline-flex items-center gap-1.5 text-brand-blue-700 hover:underline">
              <Mail className="h-4 w-4" aria-hidden="true" /> {request.email}
            </a>
            {request.phone && (
              <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1.5 text-brand-blue-700 hover:underline">
                <Phone className="h-4 w-4" aria-hidden="true" /> {request.phone}
              </a>
            )}
          </div>

          <div className="mt-4 flex gap-1" role="tablist" aria-label="Booking sections">
            {tabs.map(([value, title]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === value ? "border-brand-blue-600 text-brand-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {title}
                {value === "activity" && request.activity.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{request.activity.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6" role="tabpanel">
          {tab === "details" && (
            <>
              {archived && <RequestRetentionPanel request={request} adminRole={adminRole} onClose={onClose} />}

              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {[
                  ["Trip date", request.tripDate ? formatDate(request.tripDate) : "—"],
                  ["Payment", `${money(request.quoteCurrency, request.amountPaid)} · ${statusLabel(request.paymentStatus)}`],
                  ["Assigned", request.assigneeName ?? "Unassigned"],
                  ["Follow-up", request.followUpAt ? formatDateTime(request.followUpAt) : "—"],
                ].map(([term, value]) => (
                  <div key={term} className="bg-white px-4 py-3">
                    <dt className="text-xs font-medium text-slate-500">{term}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <section className="rounded-xl border border-slate-200 bg-white">
                <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">What the traveller asked for</h3>
                <dl className="divide-y divide-slate-100">
                  {request.details.map((detail) => (
                    <div key={detail.label} className="grid gap-1 px-5 py-3 sm:grid-cols-[11rem_1fr]">
                      <dt className="text-sm text-slate-500">{detail.label}</dt>
                      <dd className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {!archived && (
                <TravellerDetailsEditor
                  request={{ source: request.source, sourceId: request.sourceId, fullName: request.fullName, email: request.email, phone: request.phone, submitted: request.submitted }}
                />
              )}
            </>
          )}

          {tab === "manage" && !archived && (
            <>
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900">Status, owner and follow-up</h3>
                <p className="mt-0.5 text-sm text-slate-500">Changes are logged in Activity. Tick &ldquo;Email this update&rdquo; to tell the traveller.</p>
                <BookingOperationsForm request={request} operators={operators} />
              </section>
              <RequestRetentionPanel request={request} adminRole={adminRole} onClose={onClose} />
            </>
          )}

          {tab === "payment" && !archived && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-brand-orange-600" aria-hidden="true" /> Send a payment request
              </h3>
              <p className="mt-0.5 text-sm leading-6 text-slate-500">
                Emails the traveller a branded invoice and itinerary PDF with the payment policy and Mobile Money details.
              </p>
              <PaymentRequestForm request={request} />
            </section>
          )}

          {tab === "activity" && (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MessageSquareText className="h-4 w-4 text-brand-blue-600" aria-hidden="true" /> Activity
              </h3>
              {request.activity.length ? (
                <ol className="mt-4 space-y-4">
                  {request.activity.map((item) => (
                    <li key={item.id} className="border-l-2 border-slate-200 pl-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{label(item.type)}</span>
                        <span>{item.authorName}</span>
                        <span aria-hidden="true">·</span>
                        <time>{formatDateTime(item.createdAt)}</time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.summary}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Changes and internal notes will appear here.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestRetentionPanel({
  request,
  adminRole,
  onClose,
}: {
  request: TravelRequestRecord;
  adminRole: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const initialState: BookingOperationState = { success: false, message: "" };
  const [archiveState, archiveAction, archivePending] = useActionState(
    setRequestArchiveState,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    permanentlyDeleteRequest,
    initialState,
  );

  useEffect(() => {
    if (!archiveState.success || !archiveState.completedAt) return;
    router.refresh();
    onClose();
  }, [archiveState.completedAt, archiveState.success, onClose, router]);

  useEffect(() => {
    if (!deleteState.success || !deleteState.completedAt) return;
    router.refresh();
    onClose();
  }, [deleteState.completedAt, deleteState.success, onClose, router]);

  return (
    <section className={
      "rounded-xl border bg-white p-5 " +
      (request.archivedAt ? "border-slate-300" : "border-brand-blue-200")
    }>
      <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
        {request.archivedAt ? (
          <ArchiveRestore className="h-5 w-5 text-brand-blue-600" />
        ) : (
          <Archive className="h-5 w-5 text-brand-blue-600" />
        )}
        Request cleanup
      </h3>

      {request.archivedAt ? (
        <div className="mt-4 space-y-5">
          <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
            <p className="font-bold text-slate-900">
              Archived {formatDateTime(request.archivedAt)}
            </p>
            {request.archiveReason && (
              <p className="mt-1 leading-6">{request.archiveReason}</p>
            )}
          </div>

          <form action={archiveAction}>
            <input type="hidden" name="requestKind" value={request.source} />
            <input type="hidden" name="requestId" value={request.sourceId} />
            <input type="hidden" name="archiveOperation" value="restore" />
            <button
              type="submit"
              disabled={archivePending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-5 text-sm font-bold text-white transition hover:bg-brand-blue-800 disabled:cursor-wait disabled:opacity-60"
            >
              <ArchiveRestore className="h-4 w-4" />
              {archivePending ? "Restoring…" : "Restore to active queue"}
            </button>
          </form>

          {adminRole === "owner" && (
            <form action={deleteAction} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                <div>
                  <p className="text-sm font-bold text-rose-950">Permanent deletion</p>
                  <p className="mt-1 text-xs leading-5 text-rose-800">
                    Owner only. This is limited to archived requests with no payment
                    or transport assignment. The deletion audit entry is retained.
                  </p>
                </div>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-rose-800">
                  Type {request.reference} to confirm
                </span>
                <input
                  name="confirmationReference"
                  required
                  autoComplete="off"
                  className={inputClass}
                />
              </label>
              <input type="hidden" name="requestKind" value={request.source} />
              <input type="hidden" name="requestId" value={request.sourceId} />
              {deleteState.message && (
                <p
                  aria-live="polite"
                  className={
                    "mt-3 rounded-xl px-3 py-2 text-sm font-semibold " +
                    (deleteState.success
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-900")
                  }
                >
                  {deleteState.message}
                </p>
              )}
              <button
                type="submit"
                disabled={deletePending}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-5 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deletePending ? "Deleting permanently…" : "Permanently delete request"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <form action={archiveAction} className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            Archive removes this request from the active queue without losing its
            history. It can be restored later.
          </p>
          <Field label="Archive reason">
            <input
              name="archiveReason"
              minLength={3}
              maxLength={500}
              required
              placeholder="For example: test submission or duplicate request"
              className={inputClass}
            />
          </Field>
          <input type="hidden" name="requestKind" value={request.source} />
          <input type="hidden" name="requestId" value={request.sourceId} />
          <input type="hidden" name="archiveOperation" value="archive" />
          {archiveState.message && (
            <p
              aria-live="polite"
              className={
                "rounded-xl px-3 py-2 text-sm font-semibold " +
                (archiveState.success
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rose-50 text-rose-800")
              }
            >
              {archiveState.message}
            </p>
          )}
          <button
            type="submit"
            disabled={archivePending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-800 transition hover:border-brand-blue-300 hover:bg-brand-blue-50 disabled:cursor-wait disabled:opacity-60"
          >
            <Archive className="h-4 w-4" />
            {archivePending ? "Archiving…" : "Archive request"}
          </button>
        </form>
      )}
    </section>
  );
}

function BookingOperationsForm({
  request,
  operators,
}: {
  request: TravelRequestRecord;
  operators: RequestOperator[];
}) {
  const router = useRouter();
  const initialState: BookingOperationState = { success: false, message: "" };
  const [state, formAction, pending] = useActionState(
    updateBookingOperation,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.completedAt) router.refresh();
  }, [router, state.completedAt, state.success]);

  const statuses = request.source === "custom" ? customStatuses : packageStatuses;

  return (
    <form action={formAction} className="mt-5 space-y-5">
      <input type="hidden" name="requestKind" value={request.source} />
      <input type="hidden" name="requestId" value={request.sourceId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Booking status">
          <select name="status" defaultValue={request.status} className={inputClass}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assigned operator">
          <select
            name="assignedTo"
            defaultValue={request.assignedTo ?? ""}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.fullName} · {label(operator.role)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select name="priority" defaultValue={request.priority} className={inputClass}>
            {[
              ["low", "Low"],
              ["normal", "Normal"],
              ["high", "High"],
              ["urgent", "Urgent"],
            ].map(([value, optionLabel]) => (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Next follow-up">
          <input
            type="datetime-local"
            name="followUpAt"
            defaultValue={datetimeInputValue(request.followUpAt)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-800">Quote and payment</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Currency">
            <select
              name="quoteCurrency"
              defaultValue={request.quoteCurrency ?? "GHS"}
              className={inputClass}
            >
              {[
                ["GHS", "GHS · Ghana cedi"],
                ["USD", "USD · US dollar"],
                ["GBP", "GBP · Pound sterling"],
                ["EUR", "EUR · Euro"],
              ].map(([value, optionLabel]) => (
                <option key={value} value={value}>
                  {optionLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quoted amount">
            <input
              type="number"
              min="0"
              step="0.01"
              name="quotedAmount"
              defaultValue={request.quotedAmount ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Deposit required">
            <input
              type="number"
              min="0"
              step="0.01"
              name="depositAmount"
              defaultValue={request.depositAmount ?? ""}
              className={inputClass}
            />
          </Field>
          {request.source === "custom" ? (
            <>
              <Field label="Amount received">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="amountPaid"
                  defaultValue={request.amountPaid}
                  className={inputClass}
                />
              </Field>
              <Field label="Payment status">
                <select
                  name="paymentStatus"
                  defaultValue={request.paymentStatus}
                  className={inputClass}
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {label(status)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Payment method">
                <select
                  name="paymentMethod"
                  defaultValue={request.paymentMethod ?? ""}
                  className={inputClass}
                >
                  <option value="">Not recorded</option>
                  <option value="mobile-money">Mobile Money</option>
                  <option value="card">Debit or credit card</option>
                  <option value="bank-transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </Field>
            </>
          ) : (
            // Group-trip payments live in the verified payment ledger; editing
            // them here was silently ignored, so show them read-only instead.
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:col-span-2">
              <p>
                <span className="font-semibold text-slate-900">
                  {money(request.quoteCurrency, request.amountPaid)} received
                </span>{" "}
                · {label(request.paymentStatus)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Group-trip payments are recorded in the payment ledger.{" "}
                <a href="/admin/payments" className="font-semibold text-brand-blue-700 underline-offset-2 hover:underline">
                  Record a payment
                </a>
              </p>
            </div>
          )}
        </div>
        {request.paymentVerifiedAt && (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            Last payment verification: {formatDateTime(request.paymentVerifiedAt)}
          </p>
        )}
      </div>

      <Field label="Internal note or traveller update">
        <textarea
          name="note"
          rows={4}
          maxLength={1500}
          placeholder="Record the latest call, quote decision, provider arrangement or next action."
          className={`${inputClass} h-auto py-3`}
        />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-brand-orange-200 bg-brand-orange-50 p-4">
        <input
          type="checkbox"
          name="notifyTraveller"
          className="mt-0.5 h-4 w-4 rounded border-brand-orange-300 text-brand-orange-600"
        />
        <span>
          <span className="block text-sm font-semibold text-brand-orange-950">
            Email this update to the traveller
          </span>
          <span className="mt-1 block text-xs leading-5 text-brand-orange-800">
            Sends the current booking status, payment status, amount recorded and
            the note above.
          </span>
        </span>
      </label>

      {state.message && (
        <p
          aria-live="polite"
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            state.success
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue-700 px-5 text-sm font-bold text-white transition hover:bg-brand-blue-800 disabled:cursor-wait disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {pending ? "Saving changes…" : "Save booking operations"}
      </button>
    </form>
  );
}

function PaymentRequestForm({ request }: { request: TravelRequestRecord }) {
  const router = useRouter();
  const initialState: BookingOperationState = { success: false, message: "" };
  const [state, formAction, pending] = useActionState(
    sendBookingPaymentRequest,
    initialState,
  );
  const outstanding = Math.max(
    0,
    (request.quotedAmount ?? 0) - request.amountPaid,
  );
  const defaultDeposit = request.depositAmount ?? outstanding * 0.5;

  useEffect(() => {
    if (state.success && state.completedAt) router.refresh();
  }, [router, state.completedAt, state.success]);

  return (
    <form action={formAction} className="mt-5 space-y-5">
      <input type="hidden" name="requestKind" value={request.source} />
      <input type="hidden" name="requestId" value={request.sourceId} />
      <input type="hidden" name="bookingSummary" value={request.summary} />
      <input type="hidden" name="travellers" value={request.travellers} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment requested">
          <select
            name="paymentRequestType"
            defaultValue={defaultDeposit < outstanding ? "deposit" : "full"}
            className={inputClass}
          >
            <option value="deposit">Deposit</option>
            <option value="balance">Outstanding balance</option>
            <option value="full">Full payment</option>
            <option value="installment">Installment</option>
          </select>
        </Field>
        <Field label="Currency">
          <select
            name="paymentCurrency"
            defaultValue={request.quoteCurrency ?? "GHS"}
            className={inputClass}
          >
            <option value="GHS">GHS · Ghana cedi</option>
            <option value="USD">USD · US dollar</option>
            <option value="GBP">GBP · Pound sterling</option>
            <option value="EUR">EUR · Euro</option>
          </select>
        </Field>
        <Field label="Amount due">
          <input
            type="number"
            min="0.01"
            max={outstanding || undefined}
            step="0.01"
            name="paymentRequestAmount"
            defaultValue={
              request.paymentRequestAmount ??
              Math.min(defaultDeposit, outstanding || defaultDeposit)
            }
            required
            className={inputClass}
          />
        </Field>
        <Field label="Payment deadline">
          <input
            type="date"
            name="paymentDueDate"
            defaultValue={
              request.paymentDueAt ?? defaultPaymentDeadline(request.tripDate)
            }
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Confirmed itinerary">
        <textarea
          name="confirmedItinerary"
          rows={7}
          minLength={10}
          maxLength={8000}
          defaultValue={request.confirmedItinerary ?? request.summary}
          placeholder="Add the confirmed day-by-day or journey itinerary that should appear in the attached PDF."
          required
          className={inputClass + " h-auto py-3"}
        />
      </Field>

      <Field label="Optional message to traveller">
        <textarea
          name="paymentMessage"
          rows={3}
          maxLength={1500}
          placeholder="Add any booking-specific payment or preparation note."
          className={inputClass + " h-auto py-3"}
        />
      </Field>

      <div className="rounded-xl border border-brand-blue-200 bg-brand-blue-50 p-4 text-sm leading-6 text-brand-blue-950">
        <p className="font-bold">Payment channels included</p>
        <p className="mt-1">
          MTN MoMo 0248442916 and Telecel Cash 0506191365, both registered
          to TRANSVISTA AFRICA LTD.
        </p>
        <p className="mt-2 text-xs text-brand-blue-800">
          Bank transfer is withheld until verified bank-account details are
          configured. The booking reference is used as the payment reference.
        </p>
      </div>

      {request.paymentRequestSentAt && (
        <p className="text-xs font-semibold text-slate-500">
          Last payment request sent {formatDateTime(request.paymentRequestSentAt)}
          {request.paymentDueAt ? " · due " + formatDate(request.paymentDueAt) : ""}
        </p>
      )}

      {state.message && (
        <p
          aria-live="polite"
          className={
            "rounded-xl px-4 py-3 text-sm font-semibold " +
            (state.success
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800")
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || outstanding <= 0}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange-600 px-5 text-sm font-bold text-white transition hover:bg-brand-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {pending ? "Creating documents and sending…" : "Send payment request"}
      </button>
      {outstanding <= 0 && (
        <p className="text-center text-xs font-semibold text-emerald-700">
          No outstanding balance remains on this booking.
        </p>
      )}
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-100";

function Field({ label: fieldLabel, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {fieldLabel}
      </span>
      {children}
    </label>
  );
}

function FilterSelect({
  label: selectLabel,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label>
      <span className="sr-only">{selectLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} capitalize`}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}


function EmptyMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}

