import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { brand } from "@/constants/config/brand";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Contact TransVista",
  description:
    "Talk to TransVista Africa on WhatsApp, by phone or by email. We respond to trip requests within 48 hours.",
  path: "/contact",
});

const channels = [
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: brand.contact.phoneDisplay,
    href: whatsappLink("Hi TransVista Africa, I have a question."),
    note: "Fastest way to reach us.",
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: brand.contact.phoneDisplay,
    href: brand.contact.phoneHref,
    note: "Call during working hours.",
  },
  {
    icon: Mail,
    label: "Email",
    value: brand.contact.email,
    href: `mailto:${brand.contact.email}`,
    note: "For proposals, invoices and partnerships.",
  },
];

export default function ContactPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Contact"
        title="Talk to a real person."
        lead="Questions about a trip, a payment or partnering with TransVista? Reach us any of these ways."
      />

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {channels.map(({ icon: Icon, label, value, href, note, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="rounded-[24px] border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-600"
              >
                <Icon className="h-7 w-7 text-brand-blue-700" aria-hidden="true" />
                <h2 className="font-display mt-4 text-xl font-semibold text-slate-900">
                  {label}
                </h2>
                <p className="mt-1 font-semibold text-brand-blue-800">{value}</p>
                <p className="mt-2 text-sm text-slate-600">{note}</p>
              </a>
            ))}
          </div>

          <p className="mt-8 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4" aria-hidden="true" /> Accra, Ghana
          </p>

          <div className="mt-10 rounded-[24px] border border-brand-blue-100 bg-brand-blue-50 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Planning a trip?
            </h2>
            <p className="mt-2 text-base text-slate-700">
              The trip request form gives us everything we need to send you a
              proposal within 48 hours.
            </p>
            <Link
              href="/plan"
              className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-brand-orange-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-orange-700"
            >
              Start my trip request
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
