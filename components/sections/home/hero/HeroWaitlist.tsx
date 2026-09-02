import Link from "next/link";
import { WaitlistForm } from "@/components/sections/home/waitlist/WaitlistForm";
import { TrustBadge } from "@/components/shared/TrustBadge";
import { heroTrustItems } from "@/constants/data/hero";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroWaitlist() {
  return (
    <div className="mt-8">
      <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 shadow-[0_20px_50px_-28px_rgba(8,18,53,0.65)] backdrop-blur-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-300">
          Join early
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Get launch updates and early access. Takes less than a minute.
        </p>
        <div className="mt-5">
          <WaitlistForm variant="compact" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/packages/volta-highlands-escape"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full rounded-full sm:w-auto",
          )}
        >
          Plan a Volta trip
        </Link>
        <Link
          href="/#explore-ghana"
          className={cn(
            buttonVariants({ variant: "outline-white", size: "lg" }),
            "w-full rounded-full sm:w-auto",
          )}
        >
          Explore Ghana
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        {heroTrustItems.map((item) => (
          <TrustBadge key={item} text={item} tone="dark" />
        ))}
      </div>
    </div>
  );
}
