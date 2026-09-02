import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/TrustBadge";
import { heroTrustItems } from "@/constants/data/hero";
import { cn } from "@/lib/utils";

export function HeroActions() {
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="#plan-your-trip"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "pulse-glow w-full rounded-full sm:w-auto",
          )}
        >
          Plan My Trip
        </Link>

        <Link
          href="#explore-ghana"
          className={cn(
            buttonVariants({ variant: "outline-white", size: "lg" }),
            "w-full rounded-full transform transition-all duration-300 ease-out hover:-translate-y-0.5 sm:w-auto",
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
