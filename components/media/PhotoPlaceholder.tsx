/**
 * Branded stand-in until original TransVista photography is added
 * (see docs/PHOTOS.md). Deliberately calm: deep brand blue, a faint
 * contour pattern, and one quiet line of text.
 */
export function PhotoPlaceholder({
  label = "Original photography coming soon",
  caption,
}: {
  label?: string;
  caption?: string;
}) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-blue-800 via-brand-blue-900 to-brand-blue-950 p-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18] [background-image:repeating-radial-gradient(circle_at_70%_30%,transparent_0,transparent_14px,rgba(255,255,255,0.55)_15px,transparent_16px)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-orange-500/25 blur-3xl"
      />
      <p className="relative text-center text-xs font-medium tracking-wide text-white/70">
        {label}
        {caption ? <span className="sr-only"> — {caption}</span> : null}
      </p>
    </div>
  );
}
