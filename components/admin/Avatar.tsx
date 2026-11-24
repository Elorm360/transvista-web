import { cn } from "@/lib/utils";
import { avatarUrl, initialsFor } from "@/lib/admin/avatars";

const sizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const;

/** A team member's photo, or their initials when they haven't added one. */
export function Avatar({
  name,
  path,
  src,
  size = "md",
  className,
}: {
  name: string;
  /** Storage path from the database. */
  path?: string | null;
  /** Ready-made URL (e.g. a local preview); takes precedence over `path`. */
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const url = src ?? avatarUrl(path);
  return url ? (
    // Small, already-resized image from our own storage; next/image adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={cn("shrink-0 rounded-full object-cover", sizes[size], className)} />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-orange-50 font-semibold text-brand-orange-800",
        sizes[size],
        className,
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
