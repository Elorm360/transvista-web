import Link from "next/link";
import type { MouseEventHandler } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanTripButtonProps {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  tabIndex?: number;
}

export function PlanTripButton({
  className,
  onClick,
  tabIndex,
}: PlanTripButtonProps) {
  return (
    <Link
      href="/#plan-your-trip"
      onClick={onClick}
      tabIndex={tabIndex}
      className={cn(
        buttonVariants({ variant: "default", size: "default" }),
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-blue-900/15",
        className,
      )}
    >
      Plan My Trip
    </Link>
  );
}
