import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

import { footerContent } from "@/content/footer";

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

            <ul className="mt-5 space-y-3">
              {footerContent.socials.map((social) => (
                <li key={social.label}>
                  {social.comingSoon ? (
                    <span className="flex cursor-default items-center gap-2 text-sm text-slate-600">
                      {social.label}
                      <span className="text-xs uppercase tracking-wider text-slate-700">
                        Coming Soon
                      </span>
                    </span>
                  ) : (
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full text-sm text-slate-400 transition-colors duration-200 ease-out hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
                      aria-label={`Follow TransVista on ${social.label}`}
                    >
                      {social.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
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
