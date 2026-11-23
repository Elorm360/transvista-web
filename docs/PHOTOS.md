# Replacing placeholder photos with TransVista originals

Several destination and experience pages have no photo yet, or use an
illustrative one.

## Destinations and experiences: drop in and run one command

1. Save the original photo as `photos/destinations/<slug>.jpg` or
   `photos/experiences/<slug>.jpg`. The full list of names is in
   [`photos/README.md`](../photos/README.md).
2. Optional: put a one-line description in `<slug>.txt` next to it (alt text).
3. Run `npm run photos`.

`scripts/optimize-photos.mjs` then:

- applies the camera's rotation and strips all metadata, including GPS;
- resizes to at most 1600 px wide and saves a compressed JPEG to
  `public/images/destinations/<slug>.jpg` or
  `public/images/experiences/<slug>-original.jpg`;
- records it in `constants/data/photos.generated.json`.

The data modules overlay that file onto `constants/data/destinations.ts` and
`experiences.ts` (via `constants/data/photos.ts`). That means cards, detail
pages and link previews all switch to the original photo, and the caption
changes to "Original TransVista photography.", without editing any code.

The script stops with a message for: unknown names (typos), HEIC files,
portrait photos (they get cropped on wide layouts) and photos under 1200 px
wide.

Commit the new files in `public/images/` and `photos.generated.json`. The
originals in `photos/` are git-ignored.

To remove an original photo, delete its file in `public/images/` and run
`npm run photos` again.

## Everything else (manual)

| What | Folder | Where it is referenced |
|---|---|---|
| Past-event and group-trip pages | `public/images/experiences/` | Event and package records → `image_path`, `image_alt` (admin) |
| Homepage hero slideshow | `public/images/hero/` | `components/sections/home/hero/` |
| Traveller stories | `public/images/testimonials/` | `content/testimonials.ts` |

For these, prepare the photo yourself: landscape, about 1600 px wide,
JPG or WebP, ideally under 500 KB.

## Check

Run `npm run build`, then open the page. Push the branch and check the
Vercel preview before merging.
