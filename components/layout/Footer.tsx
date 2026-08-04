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
    <footer className="bg-slate-900 pt-20 text-slate-300 lg:pt-28">
      <Container>
        {/* ── Grid: Brand + Explore + Contact + Stay Connected ── */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Logo width={40} height={40} className="shrink-0" imageClassName="h-[40px] w-auto" />

            <p className="mt-4 text-lg font-semibold text-white">
              {footerContent.brand.tagline}
            </p>

            <p className="mt-4 leading-7 text-slate-400">
              {footerContent.brand.mission}
            </p>
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              {footerContent.columns[0].heading}
            </h4>

            <ul className="mt-6 space-y-4">
              {footerContent.columns[0].links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href || "#"}
                    className="rounded-full text-slate-300 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Contact
            </h4>

            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href={footerContent.contact.phoneHref}
                  className="flex items-center gap-3 rounded-full text-slate-300 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  <span className="text-lg" aria-hidden="true">
                    &#9742;
                  </span>
                  {footerContent.contact.phone}
                </a>
              </li>

              <li>
                <a
                  href={footerContent.contact.emailHref}
                  className="flex items-center gap-3 rounded-full text-slate-300 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                >
                  <span className="text-lg" aria-hidden="true">
                    &#9993;
                  </span>
                  {footerContent.contact.email}
                </a>
              </li>

              <li className="flex items-center gap-3 text-slate-300">
                <span className="text-lg" aria-hidden="true">
                  &#128205;
                </span>
                {footerContent.contact.location}
              </li>
            </ul>
          </div>

          {/* Column 4 — Stay Connected */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
              Stay Connected
            </h4>

            <ul className="mt-6 space-y-4">
              {footerContent.socials.map((social) => (
                <li key={social.label}>
                  {social.comingSoon ? (
                    <span className="flex cursor-default items-center gap-2 text-slate-500">
                      {social.label}
                      <span className="text-xs uppercase tracking-wider text-slate-600">
                        Coming Soon
                      </span>
                    </span>
                  ) : (
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full text-slate-300 transition-colors duration-200 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
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
        <div className="mt-16 border-t border-slate-800 py-8 lg:flex lg:items-center lg:justify-between">
          <p className="text-sm text-slate-500">
            {footerContent.bottom.copyright}
          </p>

          <p className="mt-2 text-sm text-slate-500 lg:mt-0">
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
