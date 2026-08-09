import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  text: string;
  /** "light" for white/cream sections (default), "dark" for dark backgrounds like the hero. */
  tone?: "light" | "dark";
}

export function TrustBadge({ text, tone = "light" }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={cn("h-5 w-5", tone === "dark" ? "text-brand-orange-400" : "text-green-600")}
        aria-hidden="true"
      />

      <span
        className={cn(
          "text-sm font-medium",
          tone === "dark" ? "text-slate-200" : "text-slate-700",
        )}
      >
        {text}
      </span>
    </div>
  );
}