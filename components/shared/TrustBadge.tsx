import { CheckCircle2 } from "lucide-react";

interface TrustBadgeProps {
  text: string;
}

export function TrustBadge({ text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className="h-5 w-5 text-green-600"
        aria-hidden="true"
      />

      <span className="text-sm font-medium text-slate-700">
        {text}
      </span>
    </div>
  );
}