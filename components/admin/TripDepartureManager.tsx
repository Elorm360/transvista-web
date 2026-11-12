"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CarFront, CheckCircle2, ClipboardCheck, Clock3, MapPin, Users } from "lucide-react";
import {
  createTripDeparture,
  saveTripDeparture,
  setTripDepartureChecklistItem,
  type TripDepartureActionState,
} from "@/app/actions/trip-departures";
import type {
  TripDepartureCandidate,
  TripDepartureRecord,
} from "@/lib/dashboard/getTripDepartureOperations";
import type { TripOperationsOperator } from "@/lib/dashboard/getTripOperations";

const initialState: TripDepartureActionState = { success: false, message: "" };

function dateLabel(value: string | null) {
  if (!value) return "Date not set";
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function datetimeInput(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function human(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusStyle(status: string) {
  if (status === "ready" || status === "completed") return "bg-emerald-50 text-emerald-800";
  if (status === "underway") return "bg-blue-50 text-blue-800";
  if (status === "cancelled") return "bg-slate-100 text-slate-600";
  if (status === "confirmed") return "bg-indigo-50 text-indigo-800";
  return "bg-amber-50 text-amber-800";
}

export default function TripDepartureManager({
  departures,
  candidates,
  operators,
  readOnly,
}: {
  departures: TripDepartureRecord[];
  candidates: TripDepartureCandidate[];
  operators: TripOperationsOperator[];
  readOnly: boolean;
}) {
  const active = departures.filter((departure) => !["completed", "cancelled"].includes(departure.status));
  const ready = active.filter((departure) => departure.status === "ready").length;
  const planning = active.filter((departure) => ["planning", "confirmed"].includes(departure.status)).length;
  const underway = active.filter((departure) => departure.status === "underway").length;

  return (
    <div className="space-y-6">
      {readOnly && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
          Preview is read-only because it shares live TransVista data. You can inspect departures here, but creating or editing records is disabled.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active departures" value={active.length} icon={CalendarDays} />
        <Metric label="Planning / confirmed" value={planning} icon={Clock3} />
        <Metric label="Ready to depart" value={ready} icon={CheckCircle2} />
        <Metric label="Currently underway" value={underway} icon={CarFront} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Bookings awaiting a departure</h2>
            <p className="mt-1 text-xs text-slate-500">Create a shared departure from confirmed and active bookings. No booking or payment record is changed.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{candidates.length} booking groups</span>
        </div>
        {candidates.length ? (
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {candidates.map((candidate) => (
              <CreateDepartureCard key={candidate.key} candidate={candidate} operators={operators} readOnly={readOnly} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-800">All eligible bookings are assigned</p>
            <p className="mt-1 text-xs text-slate-500">New confirmed bookings will appear here when they have valid trip dates.</p>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Departure operations</h2>
            <p className="mt-1 text-xs text-slate-500">Manage each departure once; all linked bookings share its operational details and readiness checklist.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{departures.length} total departures</span>
        </div>
        {departures.length ? (
          <div className="divide-y divide-slate-100">
            {departures.map((departure) => (
              <DepartureCard key={departure.id} departure={departure} operators={operators} readOnly={readOnly} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-800">No departures created yet</p>
            <p className="mt-1 text-xs text-slate-500">Use a booking group above to create the first shared departure record.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function CreateDepartureCard({
  candidate,
  operators,
  readOnly,
}: {
  candidate: TripDepartureCandidate;
  operators: TripOperationsOperator[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTripDeparture, initialState);
  useEffect(() => {
    if (state.success && state.completedAt) router.refresh();
  }, [router, state.success, state.completedAt]);

  const bookingKeys = candidate.bookings.map((booking) => booking.requestKind + "-" + booking.requestId);
  return (
    <form action={formAction} className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{candidate.title}</p>
          <p className="mt-1 text-xs text-slate-500">{dateLabel(candidate.departureDate)}{candidate.returnDate !== candidate.departureDate ? " – " + dateLabel(candidate.returnDate) : ""}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">{candidate.bookings.length} bookings</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{candidate.travellers} travellers</span>
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{dateLabel(candidate.departureDate)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.bookings.map((booking) => (
          <span key={booking.id} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{booking.reference}</span>
        ))}
      </div>
      <input type="hidden" name="bookingKeys" value={JSON.stringify(bookingKeys)} />
      <input type="hidden" name="departureDate" value={candidate.departureDate} />
      <label className="mt-4 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Departure name</span>
        <input name="title" required minLength={2} maxLength={160} defaultValue={candidate.title} className={inputClass} />
      </label>
      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Operations lead (optional)</span>
        <select name="operationsLeadId" defaultValue="" className={inputClass}>
          <option value="">Assign later</option>
          {operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.fullName} · {human(operator.role)}</option>)}
        </select>
      </label>
      {state.message && <p aria-live="polite" className={"mt-3 rounded-lg px-3 py-2 text-xs font-semibold " + (state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>{state.message}</p>}
      <button type="submit" disabled={pending || readOnly} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60">
        {readOnly ? "Read-only preview" : pending ? "Creating departure…" : "Create shared departure"}
      </button>
    </form>
  );
}

function DepartureCard({
  departure,
  operators,
  readOnly,
}: {
  departure: TripDepartureRecord;
  operators: TripOperationsOperator[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(saveTripDeparture, initialState);
  useEffect(() => {
    if (state.success && state.completedAt) router.refresh();
  }, [router, state.success, state.completedAt]);

  const completeCount = departure.checklist.filter((item) => item.isComplete).length;
  const checklistPercent = departure.checklist.length ? Math.round((completeCount / departure.checklist.length) * 100) : 0;

  return (
    <article className="px-5 py-4">
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">{departure.reference}</span>
            <span className={"rounded-full px-2.5 py-1 text-[10px] font-semibold " + statusStyle(departure.status)}>{human(departure.status)}</span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-950">{departure.title}</p>
          <p className="mt-1 text-xs text-slate-500">{dateLabel(departure.departureDate)}{departure.returnDate ? " – " + dateLabel(departure.returnDate) : ""} · {departure.bookings.length} bookings · {departure.bookings.reduce((sum, booking) => sum + booking.travellers, 0)} travellers</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>{completeCount}/{departure.checklist.length} checklist items</span>
          <span className="font-bold text-blue-700">{expanded ? "Close" : "Manage"}</span>
        </div>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{departure.meetingPoint || "Pickup not set"}</span>
        <span className="inline-flex items-center gap-1"><CarFront className="h-3.5 w-3.5" />{departure.vehicleType || "Vehicle not assigned"}</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{departure.operationsLeadName || "No operations lead"}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: checklistPercent + "%" }} />
      </div>

      {expanded && (
        <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="departureId" value={departure.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Departure name"><input name="title" required maxLength={160} defaultValue={departure.title} className={inputClass} /></Field>
              <Field label="Status">
                <select name="status" defaultValue={departure.status} className={inputClass}>
                  <option value="planning">Planning</option><option value="confirmed">Confirmed</option><option value="ready">Ready</option><option value="underway">Underway</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </Field>
              <Field label="Departure date"><input type="date" name="departureDate" required defaultValue={departure.departureDate} className={inputClass} /></Field>
              <Field label="Return date"><input type="date" name="returnDate" defaultValue={departure.returnDate ?? ""} className={inputClass} /></Field>
              <Field label="Departure time"><input type="datetime-local" name="scheduledStartAt" defaultValue={datetimeInput(departure.scheduledStartAt)} className={inputClass} /></Field>
              <Field label="Return time"><input type="datetime-local" name="scheduledEndAt" defaultValue={datetimeInput(departure.scheduledEndAt)} className={inputClass} /></Field>
              <Field label="Meeting point / pickup"><input name="meetingPoint" maxLength={500} defaultValue={departure.meetingPoint} placeholder="Confirmed pickup point" className={inputClass} /></Field>
              <Field label="Transport provider"><input name="transportProvider" maxLength={160} defaultValue={departure.transportProvider} placeholder="Confirmed provider" className={inputClass} /></Field>
              <Field label="Driver name"><input name="driverName" maxLength={160} defaultValue={departure.driverName} placeholder="Enter only after vetting" className={inputClass} /></Field>
              <Field label="Driver phone"><input name="driverPhone" maxLength={60} defaultValue={departure.driverPhone} placeholder="Verified contact number" className={inputClass} /></Field>
              <Field label="Vehicle type"><input name="vehicleType" maxLength={120} defaultValue={departure.vehicleType} placeholder="Bus, SUV, minibus…" className={inputClass} /></Field>
              <Field label="Vehicle registration"><input name="vehicleRegistration" maxLength={60} defaultValue={departure.vehicleRegistration} placeholder="Registration number" className={inputClass} /></Field>
              <Field label="Operations lead">
                <select name="operationsLeadId" defaultValue={departure.operationsLeadId ?? ""} className={inputClass}>
                  <option value="">Not assigned</option>
                  {operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.fullName} · {human(operator.role)}</option>)}
                </select>
              </Field>
            </div>
            <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <input type="checkbox" name="driverVerified" value="true" defaultChecked={departure.driverVerified} className="mt-0.5" />
              <span><strong>Driver details vetted by TransVista staff.</strong><br />Only select this after the driver's identity, licence and required documents have been checked. There are currently no driver applications recorded in the system.</span>
            </label>
            <Field label="Operations briefing / notes"><textarea name="operationsNotes" rows={3} maxLength={3000} defaultValue={departure.operationsNotes} className={inputClass + " h-auto py-3"} /></Field>
            {state.message && <p aria-live="polite" className={"rounded-lg px-3 py-2 text-xs font-semibold " + (state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>{state.message}</p>}
            <button type="submit" disabled={pending || readOnly} className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60">
              {readOnly ? "Preview — saving disabled" : pending ? "Saving departure…" : "Save departure details"}
            </button>
          </form>

          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">Departure readiness</h3>
                <span className="text-xs font-semibold text-slate-500">{completeCount}/{departure.checklist.length}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Every item must be completed before this departure can be marked ready.</p>
              <div className="mt-3 space-y-2">
                {departure.checklist.map((item) => (
                  <form key={item.id} action={setTripDepartureChecklistItem}>
                    <input type="hidden" name="departureId" value={departure.id} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="isComplete" value={item.isComplete ? "false" : "true"} />
                    <button type="submit" disabled={readOnly} className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70">
                      <span className={"mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border " + (item.isComplete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white")}>{item.isComplete ? <CheckCircle2 className="h-3 w-3" /> : null}</span>
                      <span className={"text-xs " + (item.isComplete ? "text-slate-400 line-through" : "text-slate-700")}>{item.label}</span>
                    </button>
                  </form>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900">Traveller manifest</h3>
              <p className="mt-1 text-xs text-slate-500">Bookings currently linked to this departure.</p>
              <div className="mt-3 space-y-2">
                {departure.bookings.length ? departure.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                    <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{booking.travellerName}</p><p className="text-[10px] text-slate-500">{booking.reference} · {booking.travellers} travellers</p></div>
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500">{human(booking.paymentStatus)}</span>
                  </div>
                )) : <p className="rounded-lg bg-white px-3 py-4 text-xs text-slate-500">No booking links are recorded for this departure.</p>}
              </div>
            </section>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof CalendarDays }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><Icon className="h-4 w-4 text-slate-400" /></div><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>;
}

const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
