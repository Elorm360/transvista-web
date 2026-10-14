type PlacesLeftProps = {
  placesLeft: number | null;
  capacity: number;
  tone?: "dark" | "light";
};

/** "12 of 35 places left" with a thin fill bar; hidden when unknown. */
export function PlacesLeft({ placesLeft, capacity, tone = "dark" }: PlacesLeftProps) {
  if (placesLeft === null) return null;

  const taken = capacity - placesLeft;
  const full = placesLeft === 0;
  const low = !full && placesLeft <= 8;
  const dark = tone === "dark";

  return (
    <div className="w-full max-w-xs">
      <p className={`text-sm font-medium ${dark ? "text-white" : "text-slate-900"}`}>
        {full
          ? "Fully booked. New registrations join the waitlist."
          : `${placesLeft} of ${capacity} places left${low ? " · filling fast" : ""}`}
      </p>
      <div
        className={`mt-2 h-1 overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-slate-200"}`}
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full ${full || low ? "bg-brand-orange-500" : dark ? "bg-white" : "bg-brand-blue-700"}`}
          style={{ width: `${Math.min(100, Math.round((taken / capacity) * 100))}%` }}
        />
      </div>
    </div>
  );
}
