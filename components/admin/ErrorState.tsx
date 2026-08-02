import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  /** Primary error message */
  title?: string;
  /** Supporting guidance */
  description?: string;
}

/**
 * ErrorState
 *
 * A calm, helpful error state for when data fails to load.
 * Keeps the tone supportive — never blames the user.
 *
 * Defaults to a generic message that covers most scenarios
 * (Supabase unavailable, query failure, network issues).
 */
export default function ErrorState({
  title = "We couldn't load this data right now.",
  description = "Please refresh the page or try again in a few moments. If the problem persists, contact support.",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
      </div>
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
