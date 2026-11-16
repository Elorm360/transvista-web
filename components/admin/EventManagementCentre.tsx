"use client";

import { useActionState } from "react";
import { CalendarDays, MapPin, Plus, Save } from "lucide-react";
import { createTravelEvent, updateTravelEvent, type TravelEventActionState } from "@/app/actions/travel-events";

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  region: string;
  summary: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  registration_deadline: string | null;
  price_amount: number | string;
  currency: string;
  capacity: number | null;
  pickup_location: string | null;
  image_path: string | null;
  image_alt: string | null;
  inclusions: string[];
  itinerary: Array<{ title: string; detail: string }>;
  status: string;
  featured: boolean;
};

const initialState: TravelEventActionState = { success: false, message: "" };
const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const areaClass = "mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "block text-xs font-semibold text-slate-600";

function dateLabel(value: string | null) {
  if (!value) return "Not set";
  return new Date(value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function money(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}
function statusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function statusClass(value: string) {
  if (value === "published") return "bg-emerald-50 text-emerald-800";
  if (value === "registration_closed") return "bg-amber-50 text-amber-800";
  if (value === "completed") return "bg-blue-50 text-blue-800";
  if (value === "cancelled") return "bg-slate-100 text-slate-600";
  return "bg-violet-50 text-violet-800";
}

export default function EventManagementCentre({ events, readOnly }: { events: EventRecord[]; readOnly: boolean }) {
  const drafts = events.filter((event) => event.status === "draft").length;
  const published = events.filter((event) => event.status === "published").length;
  const closed = events.filter((event) => event.status === "registration_closed").length;
  const completed = events.filter((event) => event.status === "completed").length;

  return (
    <div className="space-y-7">
      {readOnly && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">Preview is read-only because it shares live TransVista data. You can inspect the workspace, but changes are disabled.</div>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Drafts" value={drafts} />
        <Metric label="Published" value={published} />
        <Metric label="Registration closed" value={closed} />
        <Metric label="Past events" value={completed} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-brand-orange-600" /><h2 className="text-base font-bold text-slate-950">Create an event</h2></div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Start with a draft. Publish only when the itinerary, partners, dates and pricing have been confirmed.</p>
        </div>
        <div className="p-5 sm:p-6"><EventForm action={createTravelEvent} readOnly={readOnly} submitLabel="Create event" /></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div><h2 className="text-base font-bold text-slate-950">Event records</h2><p className="mt-1 text-xs text-slate-500">Edit details, publish confirmed experiences, close registration or archive completed events.</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{events.length} records</span>
        </div>
        {events.length ? <div className="divide-y divide-slate-100">
          {events.map((event) => <article key={event.id} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + statusClass(event.status)}>{statusLabel(event.status)}</span>{event.featured && <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-800">Featured</span>}</div>
                <h3 className="mt-2 text-base font-bold text-slate-950">{event.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.region}</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{dateLabel(event.start_date)}</span><span>{money(event.price_amount, event.currency)}</span></div>
              </div>
              <a href={event.status === "completed" ? "/past-events/" + event.slug : "/trips/" + event.slug} className="text-xs font-semibold text-blue-800 underline underline-offset-4" target="_blank" rel="noreferrer">View public page</a>
            </div>
            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-700">Edit event details</summary>
              <div className="border-t border-slate-200 bg-white p-4 sm:p-5"><EventForm event={event} action={updateTravelEvent} readOnly={readOnly} submitLabel="Save changes" /></div>
            </details>
          </article>)}
        </div> : <div className="px-5 py-14 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-800">No events have been added yet</p><p className="mt-1 text-xs text-slate-500">Create a draft above when the team begins planning its next event.</p></div>}
      </section>
    </div>
  );
}

function EventForm({ event, action, readOnly, submitLabel }: {
  event?: EventRecord;
  action: (state: TravelEventActionState, form: FormData) => Promise<TravelEventActionState>;
  readOnly: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const itineraryText = event?.itinerary?.map((stop) => stop.title + " | " + stop.detail).join("\n") ?? "";
  return (
    <form action={formAction} className="space-y-5">
      {event && <><input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="slug" value={event.slug} /></>}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Event title" name="title" required defaultValue={event?.title} placeholder="e.g. Akwapim Nature & Culture Escape" />
        {!event && <Field label="URL slug (optional)" name="slug" placeholder="Generated from the title if left blank" />}
        <Field label="Region" name="region" required defaultValue={event?.region} placeholder="e.g. Eastern Region" />
        <Field label="Start date" name="startDate" type="date" required defaultValue={event?.start_date} />
        <Field label="End date" name="endDate" type="date" defaultValue={event?.end_date ?? ""} />
        <Field label="Registration deadline" name="registrationDeadline" type="date" defaultValue={event?.registration_deadline ?? ""} />
        <Field label="Price per person" name="priceAmount" type="number" min="0" step="0.01" required defaultValue={String(event?.price_amount ?? "")} placeholder="0.00" />
        <label className={labelClass}>Currency<select name="currency" defaultValue={event?.currency ?? "GHS"} className={inputClass}><option value="GHS">GHS · Ghana cedi</option><option value="USD">USD · US dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · Pound sterling</option></select></label>
        <Field label="Capacity (optional)" name="capacity" type="number" min="1" step="1" defaultValue={event?.capacity ? String(event.capacity) : ""} placeholder="Leave blank if not fixed" />
        <Field label="Pickup / meeting point" name="pickupLocation" defaultValue={event?.pickup_location ?? ""} placeholder="e.g. Accra Mall, Accra" />
        <Field label="Approved image path (optional)" name="imagePath" defaultValue={event?.image_path ?? ""} placeholder="/images/experiences/your-approved-photo.jpg" />
        <Field label="Image description (alt text)" name="imageAlt" defaultValue={event?.image_alt ?? ""} placeholder="Describe the actual event image" />
      </div>
      <label className={labelClass}>Short summary<textarea name="summary" required minLength={20} maxLength={500} defaultValue={event?.summary ?? ""} className={areaClass} placeholder="A clear summary for the public event listing." /></label>
      <label className={labelClass}>Full description<textarea name="description" maxLength={5000} defaultValue={event?.description ?? ""} className={areaClass} placeholder="More detail about the experience, destinations and what guests can expect." /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>What's included <span className="font-normal text-slate-400">(one item per line)</span><textarea name="inclusions" defaultValue={event?.inclusions?.join("\n") ?? ""} className={areaClass} placeholder={"Transport\nMeals\nGuided experience"} /></label>
        <label className={labelClass}>Itinerary <span className="font-normal text-slate-400">(one stop per line: place | detail)</span><textarea name="itinerary" defaultValue={itineraryText} className={areaClass} placeholder={"Kakum National Park | Canopy walkway experience\nHans Cottage Botel | Lunch and nature stop"} /></label>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className={labelClass}>Event status<select name="status" defaultValue={event?.status ?? "draft"} className={inputClass + " min-w-52"}><option value="draft">Draft</option><option value="published">Published · enquiries open</option><option value="registration_closed">Registration closed</option><option value="completed">Completed · move to Past Events</option><option value="cancelled">Cancelled</option></select></label>
        <label className="flex h-11 items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" name="featured" value="true" defaultChecked={event?.featured ?? false} className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />Feature on listings</label>
      </div>
      {state.message && <p role="status" className={"rounded-xl px-4 py-3 text-xs font-semibold " + (state.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}>{state.message}</p>}
      <button type="submit" disabled={pending || readOnly} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#142b65] px-5 text-sm font-bold text-white transition hover:bg-[#1c3b87] disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{pending ? "Saving…" : submitLabel}</button>
    </form>
  );
}

function Field({ label, name, defaultValue, placeholder, type = "text", required = false, min, max, step }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; type?: string; required?: boolean; min?: string; max?: string; step?: string;
}) {
  return <label className={labelClass}>{label}<input name={name} type={type} required={required} min={min} max={max} step={step} defaultValue={defaultValue} placeholder={placeholder} className={inputClass} /></label>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p></div>;
}
