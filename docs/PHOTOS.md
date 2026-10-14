# Replacing placeholder photos with TransVista originals

Many destination and experience images are temporary placeholders, or show
"Photo coming soon". To swap in an original photo, add the file and update
one line of data. No component code needs to change.

## 1. Prepare the photo
- Landscape, at least **1600 px wide**; JPG or WebP; ideally under 500 KB.
  Next.js resizes it and converts it to AVIF/WebP automatically.
- Use lowercase file names with hyphens, e.g. `accra-jamestown-lighthouse.jpg`.

## 2. Put it in the right folder
| What | Folder | Data file / field |
|---|---|---|
| Destination pages and cards | `public/images/destinations/` | `constants/data/destinations.ts` → `image`, `imageAlt` |
| Experience pages and cards | `public/images/experiences/` | `constants/data/experiences.ts` → `image`, `imageAlt` |
| Group trip (page, pop-up, share preview) | `public/images/experiences/` | `lib/travel/packages.ts` → `image`, `imageAlt` |
| Homepage hero slideshow | `public/images/hero/` | `components/sections/home/hero/HeroVisual.tsx` → `heroImages` |
| Traveller stories | `public/images/testimonials/` | `content/testimonials.ts` |

## 3. Update the data
Example for Accra in `constants/data/destinations.ts`:

```ts
image: "/images/destinations/accra-jamestown-lighthouse.jpg",
imageAlt: "Jamestown lighthouse above the fishing harbour in Accra",
```

`image: null` shows the branded "Photo coming soon" panel. Setting a path
replaces it everywhere: cards, the destination page, and the link preview
when someone shares the page on WhatsApp or Facebook.

Write `imageAlt` as a short description of what the photo shows. Screen
readers and Google use it.

## 4. Check
Run `npm run build`, then open the page. Push the branch and check the
Vercel preview before merging.
