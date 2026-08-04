import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaitlistButtonProps {
  className?: string;
}

export function WaitlistButton({ className }: WaitlistButtonProps) {
  return (
    <Link
      href="#waitlist"
      className={cn(
        buttonVariants({ variant: "default", size: "default" }),
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/15",
        className,
      )}
    >
      Join Waitlist
    </Link>
  );
}