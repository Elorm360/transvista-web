/**
 * generate-og.js
 *
 * Generates the Open Graph share image for TransVista Africa.
 *
 * Social platforms (Facebook, Twitter/X, LinkedIn, WhatsApp) do NOT render
 * SVG as an OG image — they require a raster PNG/JPG ideally 1200×630.
 *
 * This script renders an SVG template (background gradient + logo +
 * wordmark + tagline) to a 1200×630 PNG using sharp.
 *
 * Usage:
 *   node scripts/generate-og.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "..", "public/images/hero/transvista-logo.png");
const OUT_DIR = path.join(__dirname, "..", "public/images/og");
const OUT_PATH = path.join(OUT_DIR, "transvista-og.png");
const WIDTH = 1200;
const HEIGHT = 630;

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`Logo not found at ${LOGO_PATH}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const logo = await sharp(LOGO_PATH).resize(220, 220).png().toBuffer();
  const logoB64 = logo.toString("base64");

  // ── SVG template ─────────────────────────────────────────────
  // Deep slate → amber brand gradient. Centered logo + wordmark +
  // tagline. Clean, premium, and safe to crop by social cards.
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1b2d"/>
      <stop offset="55%" stop-color="#16294a"/>
      <stop offset="100%" stop-color="#1f3a63"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Ambient amber glow -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Subtle bottom accent line -->
  <rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="url(#accent)"/>

  <!-- Logo -->
  <image href="data:image/png;base64,${logoB64}" x="${WIDTH / 2 - 110}" y="120" width="220" height="220"/>

  <!-- Wordmark -->
  <text x="${WIDTH / 2}" y="445" text-anchor="middle"
        font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        font-size="64" font-weight="700" fill="#ffffff" letter-spacing="-1">
    TransVista Africa
  </text>

  <!-- Tagline -->
  <text x="${WIDTH / 2}" y="505" text-anchor="middle"
        font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        font-size="28" font-weight="500" fill="#fbbf24" letter-spacing="4">
TRAVEL&#160;&#160;&#8226;&#160;&#160;EXPLORE&#160;&#160;&#8226;&#160;&#160;CONNECT
  </text>
</svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .resize(WIDTH, HEIGHT)
    .toFile(OUT_PATH);

  const meta = await sharp(OUT_PATH).metadata();
  console.log(`✅ Generated ${OUT_PATH}`);
  console.log(`   ${meta.width}×${meta.height} ${meta.format} ${(fs.statSync(OUT_PATH).size / 1024).toFixed(1)}KB`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
