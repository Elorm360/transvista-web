/**
 * optimize-photos.mjs — `npm run photos`
 *
 * Turns original photos into web-ready images and wires them into the site.
 *
 *   photos/destinations/<slug>.jpg   →  public/images/destinations/<slug>.jpg
 *   photos/experiences/<slug>.jpg    →  public/images/experiences/<slug>-original.jpg
 *
 * For each photo it:
 *   - applies the camera's rotation, then strips all metadata (including GPS)
 *   - resizes to at most 1600 px wide and compresses to a high-quality JPEG
 *   - records it in constants/data/photos.generated.json, which the data
 *     modules read — so no code needs editing.
 *
 * Optional alt text: put a one-line description in <slug>.txt next to the
 * photo (e.g. photos/destinations/accra.txt).
 *
 * Originals in photos/ are git-ignored; only the optimized output is committed.
 * See docs/PHOTOS.md.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "constants/data/photos.generated.json");
const MAX_WIDTH = 1600;
const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);

const KINDS = {
  destinations: {
    dataFile: "constants/data/destinations.ts",
    outDir: "public/images/destinations",
    // Destination photos get their own folder, so the slug alone is unique.
    outName: (slug) => `${slug}.jpg`,
  },
  experiences: {
    dataFile: "constants/data/experiences.ts",
    outDir: "public/images/experiences",
    // Avoid clobbering the existing illustrative photos in this folder.
    outName: (slug) => `${slug}-original.jpg`,
  },
};

/** Read the slugs defined in a data file, so typos are caught early. */
function knownSlugs(dataFile) {
  const source = readFileSync(path.join(ROOT, dataFile), "utf8");
  return new Set([...source.matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]));
}

function loadManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  const manifest = loadManifest();
  let processed = 0;
  const problems = [];

  for (const [kind, config] of Object.entries(KINDS)) {
    manifest[kind] ??= {};
    const inDir = path.join(ROOT, "photos", kind);
    mkdirSync(inDir, { recursive: true });
    mkdirSync(path.join(ROOT, config.outDir), { recursive: true });

    const slugs = knownSlugs(config.dataFile);

    for (const file of readdirSync(inDir)) {
      const ext = path.extname(file).toLowerCase();
      const slug = path.basename(file, path.extname(file)).toLowerCase();
      if (ext === ".txt" || file.startsWith(".") || file.toLowerCase() === "readme.md") continue;

      if (ext === ".heic" || ext === ".heif") {
        problems.push(`${kind}/${file}: HEIC isn't supported. Export it as JPG first (iPhone: Settings → Camera → Formats → Most Compatible).`);
        continue;
      }
      if (!SUPPORTED.has(ext)) {
        problems.push(`${kind}/${file}: unsupported file type ${ext}.`);
        continue;
      }
      if (!slugs.has(slug)) {
        problems.push(`${kind}/${file}: no ${kind.slice(0, -1)} with slug "${slug}". Valid: ${[...slugs].join(", ")}.`);
        continue;
      }

      const input = path.join(inDir, file);
      const outName = config.outName(slug);
      const output = path.join(ROOT, config.outDir, outName);

      const { width, height, size } = await sharp(input)
        .rotate() // honour EXIF orientation; metadata is dropped on output
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(output);

      if (height > width) {
        problems.push(`${kind}/${file}: portrait photo — pages show photos wide, so the top and bottom will be cropped. A landscape shot works best.`);
      }
      if (width < 1200) {
        problems.push(`${kind}/${file}: only ${width}px wide — it may look soft on large screens (1600px+ recommended).`);
      }

      const altFile = path.join(inDir, `${slug}.txt`);
      const alt = existsSync(altFile) ? readFileSync(altFile, "utf8").trim() : undefined;

      manifest[kind][slug] = {
        src: `/${config.outDir.replace(/^public\//, "")}/${outName}`,
        ...(alt ? { alt } : {}),
        width,
        height,
      };
      processed += 1;
      console.log(`✓ ${kind}/${file}  ${kb(statSync(input).size)} → ${kb(size)}  (${width}×${height})`);
    }

    // Drop entries whose optimized image no longer exists.
    for (const [slug, entry] of Object.entries(manifest[kind])) {
      if (!existsSync(path.join(ROOT, "public", entry.src))) {
        delete manifest[kind][slug];
        console.log(`– removed ${kind}/${slug} (image file is gone)`);
      }
    }

    // Stable ordering keeps diffs small.
    manifest[kind] = Object.fromEntries(Object.entries(manifest[kind]).sort(([a], [b]) => a.localeCompare(b)));
  }

  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(processed ? `\n${processed} photo(s) ready.` : "\nNo photos found in photos/destinations or photos/experiences.");
  if (problems.length) {
    console.log("\nCheck these:");
    for (const problem of problems) console.log(`  ! ${problem}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
