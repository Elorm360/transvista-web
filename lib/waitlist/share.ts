import { seoConfig } from "@/constants/config/seo";

export const waitlistShareUrl = seoConfig.url;

export const waitlistShareText =
  "I'm on the TransVista waitlist to explore Ghana with trusted travel planning. Join me:";

export function waitlistWhatsAppHref() {
  return `https://wa.me/?text=${encodeURIComponent(`${waitlistShareText} ${waitlistShareUrl}`)}`;
}
