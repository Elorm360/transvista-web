"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  Inbox,
  Mail,
  MessageSquareText,
  Phone,
  Save,
  Search,
  Send,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import {
  sendBookingPaymentRequest,
  updateBookingOperation,
  type BookingOperationState,
} from "@/app/actions/booking-operations";
import type {
  RequestOperator,
  TravelRequestRecord,
} from "@/lib/dashboard/getTravelRequests";

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

function statusClass(status: string) {
  if (["completed", "paid", "confirmed"].includes(status)) {
    return "bg-emerald-50 text-emerald-800";
  }
  if (["cancelled", "closed"].includes(status)) {
    return "bg-slate-100 text-slate-600";
  }
  if (["in-progress", "deposit-paid"].includes(status)) {
    return "bg-blue-50 text-blue-800";
  }
  return "bg-amber-50 text-amber-800";
}

function priorityClass(priority: string) {
  if (priority === "urgent") return "bg-rose-100 text-rose-800";
  if (priority === "high") return "bg-orange-100 text-orange-800";
  if (priority === "low") return "bg-slate-100 text-slate-600";
  return "bg-blue-50 text-blue-700";
}

export default function TravelRequestsList({
  requests,
  operators,
}: {
  requests: TravelRequestRecord[];
  operators: RequestOperator[];
}) {
  const [selected, setSelected] = useState<TravelRequestRecord | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          request.reference,
          request.fullName,
          request.email,
          request.phone,
          request.summary,
          request.assigneeName ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesKind =
        kindFilter === "all" || request.source === kindFilter;
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || request.priority === priorityFilter;
      return matchesQuery && matchesKind && matchesStatus && matchesPriority;
    });
  }, [kindFilter, priorityFilter, query, requests, statusFilter]);

  const needsAttention = useMemo(
    () =>
      requests.filter((request) =>
        ["new", "pending-review"].includes(request.status),
      ).length,
    [requests],
  );
  const activeCount = useMemo(
    () =>
      requests.filter((request) =>
        [
          "confirmed",
          "confirmed-awaiting-deposit",
          "deposit-paid",
          "paid",
          "in-progress",
        ].includes(request.status),
      ).length,
    [requests],
  );
  const amountCollected = useMemo(
    () =>
      requests
        .filter((request) => !request.quoteCurrency || request.quoteCurrency === "GHS")
        .reduce((total, request) => total + request.amountPaid, 0),
    [requests],
  );

  useEffect(() => {
    if (!selected) return;
    const refreshed = requests.find((request) => request.id === selected.id);
    if (refreshed && refreshed.updatedAt !== selected.updatedAt) {
      setSelected(refreshed);
    }
  }, [requests, selected]);

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

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Inbox} label="All requests" value={String(requests.length)} />
        <Metric
          icon={CalendarClock}
          label="Needs attention"
          value={String(needsAttention)}
          accent="orange"
        />
        <Metric
          icon={UserRoundCheck}
          label="Confirmed or active"
          value={String(activeCount)}
          accent="blue"
        />
        <Metric
          icon={CircleDollarSign}
          label="GHS recorded"
          value={money("GHS", amountCollected)}
          accent="green"
        />
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,auto))_auto]">
        <label className="relative">
          <span className="sr-only">Search requests</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, traveller, email or destination"
            className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <FilterSelect
          label="Request type"
          value={kindFilter}
          onChange={setKindFilter}
          options={[
            ["all", "All request types"],
            ["custom", "Custom trips"],
            ["package", "Group trips"],
          ]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            ["all", "All statuses"],
            ...Array.from(new Set(requests.map((request) => request.status)))
              .sort()
              .map((status) => [status, label(status)] as [string, string]),
          ]}
        />
        <FilterSelect
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            ["all", "All priorities"],
            ["urgent", "Urgent"],
            ["high", "High"],
            ["normal", "Normal"],
            ["low", "Low"],
          ]}
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={!filteredRequests.length}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {requests.length === 0 ? (
        <EmptyMessage
          title="No travel requests yet"
          body="New custom-trip and package requests will appear here."
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyMessage
          title="No requests match these filters"
          body="Adjust the search or filters to see more bookings."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    "Reference",
                    "Traveller",
                    "Request",
                    "People",
                    "Priority",
                    "Status",
                    "Assigned",
                    "Payment",
                    "Follow-up",
                    "Received",
                    "",
                  ].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-4 py-4 text-sm font-semibold text-blue-700">
                      {request.reference}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {request.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{request.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {request.kind}
                      </p>
                      <p className="mt-1 max-w-[220px] text-sm text-slate-700">
                        {request.summary}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {request.travellers}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={priorityClass(request.priority)}>
                        {request.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={statusClass(request.status)}>
                        {label(request.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {request.assigneeName ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {label(request.paymentStatus)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {money(request.quoteCurrency, request.amountPaid)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {request.followUpAt ? formatDateTime(request.followUpAt) : "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(request)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Eye className="h-4 w-4" /> Manage
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
        <RequestDrawer
          key={selected.id}
          request={selected}
          operators={operators}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function RequestDrawer({
  request,
  operators,
  onClose,
}: {
  request: TravelRequestRecord;
  operators: RequestOperator[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-detail-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="h-full w-full max-w-3xl overflow-y-auto bg-slate-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
                {request.kind}
              </p>
              <Badge className={statusClass(request.status)}>
                {label(request.status)}
              </Badge>
              <Badge className={priorityClass(request.priority)}>
                {request.priority}
              </Badge>
            </div>
            <h2 id="request-detail-title" className="mt-2 text-xl font-bold text-slate-950">
              {request.fullName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {request.reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Close request details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${request.email}`}
              className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800"
            >
              <Mail className="h-4 w-4" /> {request.email}
            </a>
            <a
              href={`tel:${request.phone}`}
              className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold text-slate-800 ring-1 ring-slate-200"
            >
              <Phone className="h-4 w-4" /> {request.phone}
            </a>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Save className="h-5 w-5 text-blue-600" /> Booking operations
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Update ownership, workflow, quote, payment and the next follow-up.
            </p>
            <BookingOperationsForm request={request} operators={operators} />
          </section>

          <section className="rounded-2xl border border-orange-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileText className="h-5 w-5 text-orange-600" /> Payment request
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Email branded invoice and itinerary PDFs with the payment policy
              and official Mobile Money details.
            </p>
            <PaymentRequestForm request={request} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-bold text-slate-900">Traveller request</h3>
            <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {request.details.map((detail) => (
                <div
                  key={detail.label}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr]"
                >
                  <dt className="text-sm font-semibold text-slate-500">
                    {detail.label}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <MessageSquareText className="h-5 w-5 text-blue-600" /> Activity
            </h3>
            {request.activity.length ? (
              <ol className="mt-4 space-y-4">
                {request.activity.map((item) => (
                  <li key={item.id} className="border-l-2 border-blue-100 pl-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold capitalize text-blue-700">
                        {label(item.type)}
                      </span>
                      <span>{item.authorName}</span>
                      <span>·</span>
                      <time>{formatDateTime(item.createdAt)}</time>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.summary}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Operational changes and internal notes will appear here.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
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

      <label className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
        <input
          type="checkbox"
          name="notifyTraveller"
          className="mt-0.5 h-4 w-4 rounded border-orange-300 text-orange-600"
        />
        <span>
          <span className="block text-sm font-semibold text-orange-950">
            Email this update to the traveller
          </span>
          <span className="mt-1 block text-xs leading-5 text-orange-800">
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
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

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <p className="font-bold">Payment channels included</p>
        <p className="mt-1">
          MTN MoMo 0248442916 and Telecel Cash 0506191365, both registered
          to TRANSVISTA AFRICA LTD.
        </p>
        <p className="mt-2 text-xs text-blue-800">
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>
      {children}
    </span>
  );
}

function EmptyMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label: metricLabel,
  value,
  accent = "slate",
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
  accent?: "slate" | "orange" | "blue" | "green";
}) {
  const styles = {
    slate: "border-slate-200 bg-white text-slate-400",
    orange: "border-orange-200 bg-orange-50 text-orange-600",
    blue: "border-blue-200 bg-blue-50 text-blue-600",
    green: "border-emerald-200 bg-emerald-50 text-emerald-600",
  }[accent];

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{metricLabel}</p>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
