import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

/** Wide lead image for destination and experience pages. */
export function FeatureImage({
  image,
  imageAlt,
  photoNote,
}: {
  image: string | null;
  imageAlt: string;
  photoNote: string;
}) {
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 sm:aspect-[16/8]">
        {image ? (
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            quality={80}
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover"
          />
        ) : (
          <PhotoPlaceholder />
        )}
      </div>
      {image && (
        <figcaption className="mt-3 text-xs text-slate-500">{photoNote}</figcaption>
      )}
    </figure>
  );
}

/** Sticky side panel: quick facts plus the two ways to start planning. */
export function PlanAside({
  facts,
  planHref,
  whatsappMessage,
}: {
  facts: { title: string; items: string[] }[];
  planHref: string;
  whatsappMessage: string;
}) {
  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
        {facts.map((fact, i) => (
          <div key={fact.title} className={i > 0 ? "mt-6 border-t border-slate-100 pt-6" : ""}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {fact.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {fact.items.map((item) => (
                <li key={item} className="text-[15px] leading-6 text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-7 grid gap-2.5">
          <Link
            href={planHref}
            className={cn(buttonVariants({ variant: "default", size: "default" }), "w-full rounded-full")}
          >
            Plan this trip
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={whatsappLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full rounded-full")}
          >
            <FaWhatsapp className="mr-2 h-4 w-4 text-[#25D366]" aria-hidden="true" />
            Ask on WhatsApp
          </a>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Proposal within 48 hours · No payment to ask
        </p>
      </div>
    </aside>
  );
}

/** Divided bullet list used for highlights and what-to-expect. */
export function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
      {items.map((item) => (
        <li key={item} className="flex gap-4 py-3.5 text-[15px] leading-7 text-slate-700">
          <span aria-hidden="true" className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}
