import { brand } from "@/constants/config/brand";

export function whatsappLink(message: string) {
  return `https://wa.me/${brand.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
