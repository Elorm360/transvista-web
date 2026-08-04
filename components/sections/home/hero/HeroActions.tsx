import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/TrustBadge";
import { heroTrustItems } from "@/constants/data/hero";
import { cn } from "@/lib/utils";

export function HeroActions() {
  return (
    <div className="mt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="#waitlist"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full transform transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/15 sm:w-auto",
          )}
        >
          Join Waitlist
        </Link>

        <Link
          href="#explore-by-experience"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "w-full transform transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200 sm:w-auto",
          )}
        >
          Explore Ghana
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        {heroTrustItems.map((item) => (
          <TrustBadge key={item} text={item} />
        ))}
      </div>
    </div>
  );
}
