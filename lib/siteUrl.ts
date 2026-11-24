import { headers } from "next/headers";
import { seoConfig } from "@/constants/config/seo";

/**
 * The public base URL for links we email out (e.g. team invites).
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL, if explicitly configured.
 *   2. The address of the current request (the owner sending an invite from
 *      www.transvistaafrica.com produces links to www.transvistaafrica.com;
 *      a Vercel preview produces preview links; local dev produces localhost).
 *   3. The production domain from the SEO config.
 *
 * Previously this fell back straight to http://localhost:3000, so invites
 * sent from the live site pointed to an address only a developer's own
 * computer can open.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
    const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  return seoConfig.url.replace(/\/$/, "");
}
