import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
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
    <footer className="bg-slate-900 pt-14 text-slate-300 lg:pt-20">
      <Container>
        {/* ── Grid: Brand + Explore + Contact + Stay Connected ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Logo width={36} height={36} className="shrink-0" imageClassName="h-[36px] w-auto" />

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
                    className="rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
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
                  className="flex items-center gap-3 rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
                >
                  <span className="text-base" aria-hidden="true">
                    &#9742;
                  </span>
                  {footerContent.contact.phone}
                </a>
              </li>

              <li>
                <a
                  href={footerContent.contact.emailHref}
                  className="flex items-center gap-3 rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
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
                    className={`text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600 ${SOCIAL_HOVER[social.key]}`}
                  >
                    <Icon size={22} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 py-6 lg:flex-row lg:items-center lg:justify-between">
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
              <span
                key={link.label}
                className="text-sm text-slate-600"
              >
                {link.label}
                {link.comingSoon && (
                  <span className="ml-1.5 text-xs uppercase tracking-wider text-slate-600">
                    Coming Soon
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
