import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";

import { footerContent, type SocialPlatformKey } from "@/content/footer";

const SOCIAL_ICONS: Partial<Record<SocialPlatformKey, IconType>> = {
  linkedin: FaLinkedin,
  facebook: SiFacebook,
  instagram: SiInstagram,
  tiktok: SiTiktok,
};

const SOCIAL_HOVER: Record<SocialPlatformKey, string> = {
  linkedin: "hover:text-blue-500",
  facebook: "hover:text-blue-500",
  instagram: "hover:text-pink-500",
  tiktok: "hover:text-white",
};

/**
 * Footer
 *
 * The final chapter of the homepage.
 *
 * Four-column layout: brand, explore, contact, socials.
 * Deep slate background signals "you've reached the end."
 * Only subtle link color transitions — no bouncing, rotating, or flashy animations.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brand-blue-950 to-slate-950 pt-14 text-slate-300 lg:pt-20">
      {/* top accent hairline, matches navbar */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange-500/60 to-transparent"
      />

      <Container>
        <div className="mb-12 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/20 backdrop-blur-sm lg:mb-16">
          <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-10 lg:p-10">
            <div className="flex items-start gap-4 sm:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 sm:h-14 sm:w-14">
                <FaWhatsapp className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-300">
                  {footerContent.community.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {footerContent.community.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  {footerContent.community.description}
                </p>
              </div>
            </div>

            <a
              href={footerContent.community.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow the official TransVista Africa WhatsApp Channel"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-blue-950 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue-950"
            >
              <FaWhatsapp className="h-5 w-5 text-[#128C7E]" aria-hidden="true" />
              {footerContent.community.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {/* ── Grid: Brand + Explore + Contact + Stay Connected ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Logo className="w-fit shrink-0 rounded-2xl bg-white px-3 py-2" imageClassName="h-9 w-auto" />

            <p className="mt-4 text-lg font-semibold text-white">
              {footerContent.brand.tagline}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {footerContent.brand.mission}
            </p>
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {footerContent.columns[0].heading}
            </h4>

            <ul className="mt-5 space-y-3">
              {footerContent.columns[0].links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href || "#"}
                    className="rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-brand-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Contact
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={footerContent.contact.phoneHref}
                  className="flex items-center gap-3 rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-brand-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600"
                >
                  <span className="text-base" aria-hidden="true">
                    &#9742;
                  </span>
                  {footerContent.contact.phone}
                </a>
              </li>

              <li>
                <a
                  href={footerContent.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-[#6ee7a1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
                >
                  <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                  WhatsApp support
                </a>
              </li>

              <li>
                <a
                  href={footerContent.contact.emailHref}
                  className="flex items-center gap-3 rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-brand-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600"
                >
                  <span className="text-base" aria-hidden="true">
                    &#9993;
                  </span>
                  {footerContent.contact.email}
                </a>
              </li>

              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-base" aria-hidden="true">
                  &#128205;
                </span>
                {footerContent.contact.location}
              </li>
            </ul>
          </div>

          {/* Column 4 — Stay Connected */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Stay Connected
            </h4>

            <div className="mt-5 flex items-center gap-4">
              {footerContent.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.key];
                if (!Icon) return null;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow TransVista Africa on ${social.label}`}
                    className={`text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-orange-600 ${SOCIAL_HOVER[social.key]}`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-slate-500">
            {footerContent.bottom.copyright}
          </p>

          <p className="text-sm text-slate-500">
            {footerContent.bottom.builtWith}
          </p>
        </div>

        {/* ── Legal Links ── */}
        <div className="pb-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {footerContent.bottom.links.map((link) => (
              link.href && !link.comingSoon ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-500 transition-colors hover:text-brand-orange-300"
                >
                  {link.label}
                </a>
              ) : (
                <span key={link.label} className="text-sm text-slate-600">
                  {link.label}
                  {link.comingSoon && (
                    <span className="ml-1.5 text-xs uppercase tracking-wider text-slate-600">
                      Coming Soon
                    </span>
                  )}
                </span>
              )
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
