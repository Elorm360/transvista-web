"use client";

import { useActionState, useMemo, useState } from "react";
import {
  sendRequestSms,
  type SmsActionState,
} from "@/app/actions/sms-messaging";
import type { SmsMessageRecord } from "@/lib/dashboard/getSmsMessages";

export type SmsContact = {
  key: string;
  reference: string;
  fullName: string;
  phone: string;
  kind: string;
  summary: string;
};

const templates: Record<string, string> = {
  "booking-update":
    "Hello {name}, TransVista has an update for booking {reference}. Please check your email or contact 0506987204.",
  "payment-reminder":
    "Hello {name}, this is a payment reminder for TransVista booking {reference}. Please use your reference when paying or call 0506987204.",
  "trip-reminder":
    "Hello {name}, this is a reminder about your upcoming TransVista trip, booking {reference}. We will share final trip details shortly.",
  "pickup-update":
    "Hello {name}, there is a pickup update for TransVista booking {reference}. Please check your email or call 0506987204.",
  "custom-operational": "",
};

const initialState: SmsActionState = { success: false, message: "" };

export default function SmsMessagingPanel({
  contacts,
  history,
  configured,
}: {
  contacts: SmsContact[];
  history: SmsMessageRecord[];
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(sendRequestSms, initialState);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [messageType, setMessageType] = useState("booking-update");
  const [message, setMessage] = useState(templates["booking-update"]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return contacts;
    return contacts.filter((contact) =>
      [
        contact.fullName,
        contact.reference,
        contact.phone,
        contact.summary,
      ].some((field) => field.toLowerCase().includes(value)),
    );
  }, [contacts, query]);

  function toggle(key: string) {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : current.length < 20
          ? [...current, key]
          : current,
    );
  }

  function chooseTemplate(value: string) {
    setMessageType(value);
    setMessage(templates[value]);
  }

  const visibleKeys = filtered.slice(0, 20).map((contact) => contact.key);
  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selected.includes(key));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
      <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Compose operational SMS</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select one traveller or a deliberate batch of up to 20.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${
            configured
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
          }`}>
            {configured ? "Twilio configured" : "Twilio setup required"}
          </span>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Find a request
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, reference, phone or trip"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Travellers · {selected.length} selected
            </p>
            <button
              type="button"
              onClick={() =>
                setSelected((current) =>
                  allVisibleSelected
                    ? current.filter((key) => !visibleKeys.includes(key))
                    : Array.from(new Set([...current, ...visibleKeys])).slice(0, 20),
                )
              }
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              {allVisibleSelected ? "Clear visible" : "Select visible"}
            </button>
          </div>
          <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
            {filtered.length ? (
              filtered.map((contact) => (
                <label
                  key={contact.key}
                  className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    name="recipient"
                    value={contact.key}
                    checked={selected.includes(contact.key)}
                    onChange={() => toggle(contact.key)}
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {contact.fullName}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {contact.reference} · {contact.phone} · {contact.kind}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {contact.summary}
                    </span>
                  </span>
                </label>
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No request matches this search.
              </p>
            )}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Message type
          </span>
          <select
            name="messageType"
            value={messageType}
            onChange={(event) => chooseTemplate(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="booking-update">Booking update</option>
            <option value="payment-reminder">Payment reminder</option>
            <option value="trip-reminder">Upcoming trip reminder</option>
            <option value="pickup-update">Pickup update</option>
            <option value="custom-operational">Custom operational message</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Message</span>
            <span>{message.length}/320</span>
          </span>
          <textarea
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 320))}
            rows={5}
            placeholder="Write a booking-related update."
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Use {"{name}"} and {"{reference}"} to personalize each message.
          </p>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <input
            required
            type="checkbox"
            name="operationalConfirm"
            className="mt-1 h-4 w-4 accent-blue-600"
          />
          <span className="text-sm font-medium leading-5 text-amber-950">
            I confirm this message is operational and directly related to the selected travel requests—not a marketing broadcast.
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
          disabled={pending || !selected.length || !message.trim()}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Sending securely…"
            : `Send SMS to ${selected.length || 0} traveller${selected.length === 1 ? "" : "s"}`}
        </button>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <h2 className="text-lg font-bold text-slate-950">Recent SMS activity</h2>
        <p className="mt-1 text-sm text-slate-500">
          The latest 50 delivery attempts are retained for operations.
        </p>
        <div className="mt-5 space-y-3">
          {history.length ? (
            history.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">{item.reference}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    item.status === "failed"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.recipientPhone} · {item.messageType.replaceAll("-", " ")}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-700">
                  {item.body}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(item.sentAt ?? item.createdAt).toLocaleString("en-GB")}
                </p>
              </article>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No SMS messages have been sent yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
