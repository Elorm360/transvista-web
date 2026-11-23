import generated from "./photos.generated.json";

/**
 * Original TransVista photos added with `npm run photos`.
 *
 * The script (scripts/optimize-photos.mjs) resizes and compresses each
 * photo dropped into `photos/destinations/` or `photos/experiences/`,
 * writes it to `public/images/...`, and records it in
 * `photos.generated.json`. The data modules overlay those entries here,
 * so adding a photo never needs a code change. See docs/PHOTOS.md.
 */

type GeneratedPhoto = { src: string; alt?: string };
type PhotoKind = "destinations" | "experiences";

const photos = generated as Record<PhotoKind, Record<string, GeneratedPhoto>>;

const ORIGINAL_PHOTO_NOTE = "Original TransVista photography.";

type HasPhoto = {
  slug: string;
  image: string | null;
  imageAlt: string;
  photoNote: string;
};

/** Use the original photo for this item when one has been added. */
export function withOriginalPhoto<T extends HasPhoto>(kind: PhotoKind, item: T): T {
  const photo = photos[kind]?.[item.slug];
  if (!photo) return item;

  return {
    ...item,
    image: photo.src,
    imageAlt: photo.alt?.trim() || item.imageAlt,
    photoNote: ORIGINAL_PHOTO_NOTE,
  };
}
