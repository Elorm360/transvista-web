"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CarFront, Clock3, MapPin, X } from "lucide-react";
import { saveTripOperation, type TripOperationActionState } from "@/app/actions/trip-operations";
import type { TripOperationRecord, TripOperationsOperator } from "@/lib/dashboard/getTripOperations";


type DepartureGroup = {
  key: string;
  title: string;
  startDate: string;
  endDate: string;
  bookings: TripOperationRecord[];
  travellers: number;
  operationalStatus: string;
};

function groupDepartures(trips: TripOperationRecord[]): DepartureGroup[] {
  const grouped = new Map<string, TripOperationRecord[]>();
  for (const trip of trips) {
    const current = grouped.get(trip.calendarGroupKey) ?? [];
    current.push(trip);
    grouped.set(trip.calendarGroupKey, current);
  }
  return Array.from(grouped.entries()).map(([key, bookings]) => {
    const statuses = new Set(bookings.map((booking) => booking.operationalStatus));
    const operationalStatus = statuses.size === 1
      ? bookings[0].operationalStatus
      : statuses.has("underway") ? "underway" : statuses.has("planning") ? "planning" : "mixed";
    return {
      key,
      title: bookings[0].title,
      startDate: bookings.reduce((date, booking) => booking.calendarStartDate < date ? booking.calendarStartDate : date, bookings[0].calendarStartDate),
      endDate: bookings.reduce((date, booking) => booking.calendarEndDate > date ? booking.calendarEndDate : date, bookings[0].calendarEndDate),
      bookings,
      travellers: bookings.reduce((sum, booking) => sum + booking.travellers, 0),
      operationalStatus,
    };
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

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
  const [selectedDate, setSelectedDate] = useState(() => {
    const todayKey = dateKey(new Date());
    return trips.find((trip) => trip.calendarEndDate >= todayKey)?.calendarStartDate
      ?? trips[0]?.calendarStartDate
      ?? todayKey;
  });
  const [selectedTrip, setSelectedTrip] = useState<TripOperationRecord | null>(null);
  const departureGroups = useMemo(() => groupDepartures(trips), [trips]);

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
    () => departureGroups.filter((group) => group.startDate <= selectedDate && group.endDate >= selectedDate),
    [selectedDate, departureGroups],
  );
  const today = dateKey(new Date());
  const upcoming = departureGroups.filter((group) => group.endDate >= today && !group.bookings.every((booking) => ["completed", "cancelled"].includes(booking.operationalStatus)));
  const preparation = upcoming.filter((group) => group.bookings.some((booking) => booking.operationalStatus === "planning"));
  const underway = departureGroups.filter((group) => group.bookings.some((booking) => booking.operationalStatus === "underway"));

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Upcoming departures" value={String(upcoming.length)} icon={CalendarDays} />
        <Metric label="Departures needing preparation" value={String(preparation.length)} icon={Clock3} />
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
              const dayTrips = departureGroups.filter((group) => group.startDate <= key && group.endDate >= key);
              const active = selectedDate === key;
              return (
                <button key={key} type="button" onClick={() => setSelectedDate(key)}
                  className={`min-h-[88px] border-b border-r border-slate-100 p-1.5 text-left transition sm:min-h-[112px] sm:p-2 ${active ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : "hover:bg-slate-50"} ${inMonth ? "" : "bg-slate-50/60"}`}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${key === today ? "bg-orange-500 text-white" : inMonth ? "text-slate-800" : "text-slate-300"}`}>{date.getDate()}</span>
                  <span className="mt-1 block space-y-1">
                    {dayTrips.slice(0, 2).map((group) => <span key={group.key} className={`block truncate rounded px-1 py-1 text-[9px] font-semibold sm:text-[10px] ${group.operationalStatus === "ready" ? "bg-emerald-100 text-emerald-800" : group.operationalStatus === "underway" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{group.title} · {group.bookings.length} booking{group.bookings.length === 1 ? "" : "s"}</span>)}
                    {dayTrips.length > 2 && <span className="block px-1 text-[9px] font-semibold text-slate-500">+{dayTrips.length - 2} departures</span>}
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
            <p className="mt-1 text-xs text-slate-500">{selectedDayTrips.length} departure{selectedDayTrips.length === 1 ? "" : "s"} scheduled across this date</p>
          </div>
          <div className="space-y-3 p-4">
            {selectedDayTrips.length ? selectedDayTrips.map((group) => (
              <button key={group.key} type="button" onClick={() => setSelectedTrip(group.bookings[0])}
                className="block w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-700">{group.bookings.length} booking{group.bookings.length === 1 ? "" : "s"}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle(group.operationalStatus)}`}>{human(group.operationalStatus)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-950">{group.title}</p>
                <p className="mt-1 text-xs text-slate-600">{group.travellers} travellers across {group.bookings.length} booking{group.bookings.length === 1 ? "" : "s"}</p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{timeLabel(group.bookings[0].scheduledStartAt)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{group.bookings[0].meetingPoint || "Meeting point not set"}</span>
                </div>
              </button>
            )) : <div className="rounded-xl bg-slate-50 px-4 py-10 text-center"><CalendarDays className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No departures on this date</p><p className="mt-1 text-xs text-slate-500">Choose another date to view scheduled departures.</p></div>}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><h2 className="text-base font-bold text-slate-950">Upcoming departures</h2><p className="mt-1 text-xs text-slate-500">Group bookings are combined into a single departure where the package and date match.</p></div>
          <span className="text-xs font-semibold text-slate-500">{upcoming.length} active departures</span>
        </div>
        {upcoming.length ? (
          <div className="divide-y divide-slate-100">
            {upcoming.map((group) => (
              <button key={group.key} type="button" onClick={() => setSelectedTrip(group.bookings[0]) className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50">
                <div className="min-w-[220px] flex-1"><p className="text-xs font-bold text-blue-700">{group.bookings.length} booking{group.bookings.length === 1 ? "" : "s"}</p><p className="mt-1 text-sm font-semibold text-slate-900">{group.title}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(group.startDate)}{group.endDate !== group.startDate ? ` – ${dateLabel(group.endDate)}` : ""} · {group.travellers} travellers</p></div>
                <div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(group.operationalStatus)}`}>{human(group.operationalStatus)}</span><span className="text-xs font-semibold text-slate-500">{group.bookings[0].operationsLeadName ?? "No operations lead"}</span><span className="text-xs font-bold text-blue-700">Manage</span></div>
              </button>
            ))}
          </div>
        ) : <div className="px-5 py-12 text-center text-sm text-slate-500">No upcoming confirmed departures with dates are currently recorded.</div>}
      </section>

      {selectedTrip && <TripOperationDrawer key={selectedTrip.id} trip={selectedTrip} relatedTrips={departureGroups.find((group) => group.bookings.some((booking) => booking.id === selectedTrip.id))?.bookings ?? [selectedTrip]} operators={operators} onSelectTrip={setSelectedTrip} onClose={() => setSelectedTrip(null)} />}
    </>
  );
}

function TripOperationDrawer({
  trip,
  operators,
  relatedTrips,
  onSelectTrip,
  onClose,
}: {
  trip: TripOperationRecord;
  operators: TripOperationsOperator[];
  relatedTrips: TripOperationRecord[];
  onSelectTrip: (trip: TripOperationRecord) => void;
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
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bookings in this departure</p><div className="mt-2 flex flex-wrap gap-2">{relatedTrips.map((booking) => <button key={booking.id} type="button" onClick={() => onSelectTrip(booking)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${booking.id === trip.id ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>{booking.reference} · {booking.travellers} pax</button>)}</div><p className="mt-2 text-[11px] text-slate-500">Operational details are saved against each booking. Select a booking above to review or update its record.</p></div>
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
            {trip.requestKind === "package" ? (
              <Field label="Driver name"><input name="driverName" maxLength={160} defaultValue={trip.driverName} placeholder="Verified driver name" className={inputClass} /></Field>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                <p className="font-semibold">Driver assignment is not available yet</p>
                <p className="mt-1 leading-5">There are currently no driver applications or transport assignments recorded. Keep this trip unassigned until a driver has been vetted and approved.</p>
              </div>
            )}
            {trip.requestKind === "package" && <Field label="Driver phone"><input name="driverPhone" maxLength={60} defaultValue={trip.driverPhone} placeholder="Verified contact number" className={inputClass} /></Field>}
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
