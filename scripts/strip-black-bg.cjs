/**
 * Strip a black background from a logo and re-centre on a 400×400 canvas.
 *
 * Uses an exterior flood-fill instead of a colour threshold so that
 * anti-aliased edges between the logo and the black background are
 * cleanly removed without leaving a dark halo.
 *
 *   USAGE:
 *     node scripts/strip-black-bg.cjs <input-path> [output-path]
 *
 *   If output-path is omitted, writes to public/images/portfolio_grid/
 *   with the input's basename + ".png".
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const CANVAS = 400;
// Anything with max(R,G,B) <= FLOOD_MAX counts as a wall and gets flooded.
// Picking 110 catches the dark anti-aliased boundary; the cleaned blue
// of the Knot K (~rgb(120,120,255)) stays well above this threshold.
const FLOOD_MAX = 110;
// Hard black — fully transparent.
const FULL_BLACK = 50;

async function main() {
  const [, , inputPath, outputPathArg] = process.argv;
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error("✗ input not found:", inputPath);
    process.exit(1);
  }

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath =
    outputPathArg ||
    path.resolve(__dirname, "..", "public/images/portfolio_grid", `${baseName}.png`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  // Flood-fill from every edge pixel inward through any pixel whose
  // brightness is at or below FLOOD_MAX. Pixels marked here are the
  // exterior region (background + its anti-aliased shoulder).
  const exterior = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, 0, x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    stack.push(0, y, w - 1, y);
  }

  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (exterior[idx]) continue;
    const i = idx * 4;
    const m = Math.max(buf[i], buf[i + 1], buf[i + 2]);
    if (m > FLOOD_MAX) continue;
    exterior[idx] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // Knock out exterior pixels. Fully transparent for hard black, smooth
  // alpha fall-off for the brighter boundary pixels so the edge of the
  // logo isn't pixellated.
  for (let idx = 0; idx < w * h; idx++) {
    if (!exterior[idx]) continue;
    const i = idx * 4;
    const m = Math.max(buf[i], buf[i + 1], buf[i + 2]);
    if (m <= FULL_BLACK) {
      buf[i + 3] = 0;
    } else {
      const factor = (m - FULL_BLACK) / (FLOOD_MAX - FULL_BLACK);
      buf[i + 3] = Math.round(buf[i + 3] * Math.max(0, Math.min(1, factor)));
    }
  }

  // Trim transparent pixels, then resize the content to exactly CANVAS
  // wide while preserving aspect ratio.
  const trimmed = await sharp(buf, {
    raw: { width: w, height: h, channels: 4 },
  })
    .trim({ threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });

  const tw = trimmed.info.width;
  const th = trimmed.info.height;
  const scaledH = Math.round((th / tw) * CANVAS);
  const finalW = scaledH > CANVAS ? Math.round((tw / th) * CANVAS) : CANVAS;
  const finalH = scaledH > CANVAS ? CANVAS : scaledH;

  const resized = await sharp(trimmed.data)
    .resize(finalW, finalH, { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((CANVAS - finalW) / 2),
        top: Math.round((CANVAS - finalH) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ ${outputPath}: ${meta.width}×${meta.height}`);
}

main().catch(console.error);
