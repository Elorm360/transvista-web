"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CarFront, CheckCircle2, Clock3, MapPin, Users, X } from "lucide-react";
import { saveTripOperation, type TripOperationActionState } from "@/app/actions/trip-operations";
import type { TripOperationRecord, TripOperationsOperator } from "@/lib/dashboard/getTripOperations";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function dateLabel(value: string) {
  if (!value) return "Date not set";
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function timeLabel(value: string | null) {
  if (!value) return "Time not set";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" });
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
  return "bg-amber-50 text-amber-800";
}

export default function TripOperationsCalendar({
  trips,
  operators,
}: {
  trips: TripOperationRecord[];
  operators: TripOperationsOperator[];
}) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => trips[0]?.calendarStartDate ?? dateKey(new Date()));
  const [selectedTrip, setSelectedTrip] = useState<TripOperationRecord | null>(null);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      return { date, key: dateKey(date), inMonth: date.getMonth() === month.getMonth() };
    });
  }, [month]);

  const selectedDayTrips = useMemo(
    () => trips.filter((trip) => trip.calendarStartDate <= selectedDate && trip.calendarEndDate >= selectedDate),
    [selectedDate, trips],
  );
  const today = dateKey(new Date());
  const upcoming = trips.filter((trip) => trip.calendarEndDate >= today && !["completed", "cancelled"].includes(trip.operationalStatus));
  const preparation = upcoming.filter((trip) => trip.operationalStatus === "planning");
  const underway = trips.filter((trip) => trip.operationalStatus === "underway");

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Upcoming trips" value={String(upcoming.length)} icon={CalendarDays} />
        <Metric label="Preparation needed" value={String(preparation.length)} icon={Clock3} />
        <Metric label="Currently underway" value={String(underway.length)} icon={CarFront} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </h2>
              <p className="mt-1 text-xs text-slate-500">Confirmed and active bookings with trip dates</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonth(new Date())} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Today</button>
              <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="px-1 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map(({ date, key, inMonth }) => {
              const dayTrips = trips.filter((trip) => trip.calendarStartDate <= key && trip.calendarEndDate >= key);
              const active = selectedDate === key;
              return (
                <button key={key} type="button" onClick={() => setSelectedDate(key)}
                  className={`min-h-[88px] border-b border-r border-slate-100 p-1.5 text-left transition sm:min-h-[112px] sm:p-2 ${active ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : "hover:bg-slate-50"} ${inMonth ? "" : "bg-slate-50/60"}`}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${key === today ? "bg-orange-500 text-white" : inMonth ? "text-slate-800" : "text-slate-300"}`}>{date.getDate()}</span>
                  <span className="mt-1 block space-y-1">
                    {dayTrips.slice(0, 2).map((trip) => <span key={trip.id} className={`block truncate rounded px-1 py-1 text-[9px] font-semibold sm:text-[10px] ${trip.operationalStatus === "ready" ? "bg-emerald-100 text-emerald-800" : trip.operationalStatus === "underway" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{trip.title}</span>)}
                    {dayTrips.length > 2 && <span className="block px-1 text-[9px] font-semibold text-slate-500">+{dayTrips.length - 2} more</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Daily operations</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">{dateLabel(selectedDate)}</h2>
            <p className="mt-1 text-xs text-slate-500">{selectedDayTrips.length} trip{selectedDayTrips.length === 1 ? "" : "s"} scheduled across this date</p>
          </div>
          <div className="space-y-3 p-4">
            {selectedDayTrips.length ? selectedDayTrips.map((trip) => (
              <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)}
                className="block w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">{trip.reference}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle(trip.operationalStatus)}`}>{human(trip.operationalStatus)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-950">{trip.title}</p>
                <p className="mt-1 text-xs text-slate-600">{trip.travellerName} · {trip.travellers} traveller{trip.travellers === 1 ? "" : "s"}</p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{timeLabel(trip.scheduledStartAt)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.meetingPoint || "Meeting point not set"}</span>
                </div>
              </button>
            )) : <div className="rounded-xl bg-slate-50 px-4 py-10 text-center"><CalendarDays className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No trips on this date</p><p className="mt-1 text-xs text-slate-500">Choose another date to view scheduled trips.</p></div>}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><h2 className="text-base font-bold text-slate-950">Upcoming operations</h2><p className="mt-1 text-xs text-slate-500">Operational details are only shown when your team records them.</p></div>
          <span className="text-xs font-semibold text-slate-500">{upcoming.length} active</span>
        </div>
        {upcoming.length ? (
          <div className="divide-y divide-slate-100">
            {upcoming.map((trip) => (
              <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50">
                <div className="min-w-[220px] flex-1"><p className="text-xs font-bold text-blue-700">{trip.reference} · {trip.travellerName}</p><p className="mt-1 text-sm font-semibold text-slate-900">{trip.title}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(trip.tripStart)}{trip.tripEnd !== trip.tripStart ? ` – ${dateLabel(trip.tripEnd)}` : ""} · {trip.travellers} traveller{trip.travellers === 1 ? "" : "s"}</p></div>
                <div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(trip.operationalStatus)}`}>{human(trip.operationalStatus)}</span><span className="text-xs font-semibold text-slate-500">{trip.operationsLeadName ?? "No operations lead"}</span><span className="text-xs font-bold text-blue-700">Manage</span></div>
              </button>
            ))}
          </div>
        ) : <div className="px-5 py-12 text-center text-sm text-slate-500">No upcoming confirmed trips with dates are currently recorded.</div>}
      </section>

      {selectedTrip && <TripOperationDrawer key={selectedTrip.id} trip={selectedTrip} operators={operators} onClose={() => setSelectedTrip(null)} />}
    </>
  );
}

function TripOperationDrawer({
  trip,
  operators,
  onClose,
}: {
  trip: TripOperationRecord;
  operators: TripOperationsOperator[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveTripOperation, { success: false, message: "" } satisfies TripOperationActionState);
  useEffect(() => {
    if (state.success && state.completedAt) router.refresh();
  }, [router, state.success, state.completedAt]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" role="dialog" aria-modal="true" aria-labelledby="trip-operation-title">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{trip.reference}</p><h2 id="trip-operation-title" className="mt-1 text-xl font-bold text-slate-950">{trip.title}</h2><p className="mt-1 text-sm text-slate-500">{trip.travellerName} · {trip.travellers} travellers</p></div>
          <button type="button" onClick={onClose} aria-label="Close trip operations" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <form action={formAction} className="space-y-5 p-6">
          <input type="hidden" name="requestKind" value={trip.requestKind} />
          <input type="hidden" name="requestId" value={trip.requestId} />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-bold text-slate-900">Booking overview</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-400">Trip date</p><p className="mt-1 font-semibold text-slate-800">{dateLabel(trip.tripStart)}{trip.tripEnd !== trip.tripStart ? ` – ${dateLabel(trip.tripEnd)}` : ""}</p></div><div><p className="text-slate-400">Payment status</p><p className="mt-1 font-semibold text-slate-800">{human(trip.paymentStatus)}</p></div><div><p className="text-slate-400">Booking owner</p><p className="mt-1 font-semibold text-slate-800">{trip.assignedName ?? "Unassigned"}</p></div><div><p className="text-slate-400">Contact</p><p className="mt-1 font-semibold text-slate-800">{trip.phone}</p></div></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Departure date and time"><input type="datetime-local" name="scheduledStartAt" defaultValue={datetimeInput(trip.scheduledStartAt)} className={inputClass} /></Field>
            <Field label="Return date and time"><input type="datetime-local" name="scheduledEndAt" defaultValue={datetimeInput(trip.scheduledEndAt)} className={inputClass} /></Field>
            <Field label="Meeting point / pickup"><input name="meetingPoint" maxLength={500} defaultValue={trip.meetingPoint} placeholder="Confirmed meeting point" className={inputClass} /></Field>
            <Field label="Operations lead"><select name="operationsLeadId" defaultValue={trip.operationsLeadId ?? ""} className={inputClass}><option value="">Not assigned</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.fullName} · {human(operator.role)}</option>)}</select></Field>
            <Field label="Transport provider"><input name="transportProvider" maxLength={500} defaultValue={trip.transportProvider} placeholder="Verified provider name" className={inputClass} /></Field>
            <Field label="Driver name"><input name="driverName" maxLength={160} defaultValue={trip.driverName} placeholder="Add after confirmation" className={inputClass} /></Field>
            <Field label="Driver phone"><input name="driverPhone" maxLength={60} defaultValue={trip.driverPhone} placeholder="Verified contact number" className={inputClass} /></Field>
            <Field label="Vehicle type"><input name="vehicleType" maxLength={120} defaultValue={trip.vehicleType} placeholder="Vehicle type" className={inputClass} /></Field>
            <Field label="Vehicle registration"><input name="vehicleRegistration" maxLength={60} defaultValue={trip.vehicleRegistration} placeholder="Registration number" className={inputClass} /></Field>
            <Field label="Operations status"><select name="operationalStatus" defaultValue={trip.operationalStatus} className={inputClass}><option value="planning">Planning</option><option value="ready">Ready</option><option value="underway">Underway</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field>
          </div>
          <Field label="Operations notes / briefing"><textarea name="operationsNotes" rows={4} maxLength={3000} defaultValue={trip.operationsNotes} placeholder="Record confirmed supplier arrangements, itinerary handover, special requirements or team briefing." className={inputClass + " h-auto py-3"} /></Field>
          {state.message && <p aria-live="polite" className={`rounded-xl px-4 py-3 text-sm font-semibold ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{state.message}</p>}
          <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Saving trip operations…" : "Save trip operations"}</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}
const inputClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CalendarDays }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{label}</p><Icon className="h-5 w-5 text-slate-400" /></div><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p></div>;
}
