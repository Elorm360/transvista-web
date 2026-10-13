import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { whatsappLink } from "@/lib/whatsapp";

type SubmissionSuccessProps = {
  title: string;
  reference: string;
  intro: string;
  steps: string[];
  emailSent?: boolean;
  calendar?: { googleUrl: string; icsPath: string };
};

/**
 * Shown after a request or registration is saved: the reference, what
 * happens next, and a one-tap WhatsApp follow-up that quotes the reference.
 */
export function SubmissionSuccess({
  title,
  reference,
  intro,
  steps,
  emailSent = true,
  calendar,
}: SubmissionSuccessProps) {
  return (
    <div
      className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 sm:p-8"
      role="status"
    >
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h2 className="font-display mt-4 text-2xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">{intro}</p>
        <p className="mx-auto mt-4 inline-flex rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm text-slate-700">
          Your reference:&nbsp;<strong className="tracking-wide">{reference}</strong>
        </p>
      </div>

      <ol className="mx-auto mt-7 max-w-md space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                index === 0
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 bg-white text-slate-600"
              }`}
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      {!emailSent && (
        <p className="mt-5 text-center text-sm text-slate-500">
          Your details were saved, but the confirmation email may be delayed.
          Keep your reference handy.
        </p>
      )}

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappLink(
            `Hi TransVista Africa, I just submitted ${reference}. I have a quick question.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          Chat with us about {reference}
        </a>
        {calendar && (
          <>
            <a
              href={calendar.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Google Calendar
            </a>
            <a
              href={calendar.icsPath}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Apple / Outlook
            </a>
          </>
        )}
      </div>
    </div>
  );
}
