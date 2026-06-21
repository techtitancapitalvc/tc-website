/**
 * Generates a "flipped variant" PNG for a monogram-style logo.
 *
 * The portfolio card flips on hover and applies CSS
 * `brightness(0) invert(1)` to the logo so it becomes a clean white
 * silhouette on the dark back face. For some logos that's wrong — a
 * yellow tile with a black bolt becomes a solid white blob with no
 * detail visible. We want the tile to go white and the interior glyph
 * to become transparent so the card colour shows through.
 *
 * Algorithm:
 *   1. Detect the dominant opaque colour ("wall")
 *   2. Flood-fill from the image edges through every non-wall pixel
 *   3. Build the output:
 *        - transparent pixels stay transparent
 *        - wall pixels become white (visible silhouette)
 *        - non-wall pixels reachable from outside become white too
 *          (e.g. the "Home" wordmark sitting below the yellow tile)
 *        - non-wall pixels NOT reachable are enclosed (the bolt, the
 *          "Smylo" letters carved out of the yellow) → fully transparent
 *
 *   USAGE:
 *     node scripts/make-flipped-variant.cjs <input> <output>
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const COLOUR_TOLERANCE = 80;
const ALPHA_THRESHOLD = 200;

async function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/make-flipped-variant.cjs <input> <output>");
    process.exit(1);
  }
  if (!fs.existsSync(inputPath)) {
    console.error("✗ input not found:", inputPath);
    process.exit(1);
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  // 1. Dominant colour via 4-bits-per-channel histogram.
  const counts = new Map();
  for (let i = 0; i < buf.length; i += 4) {
    if (buf[i + 3] < ALPHA_THRESHOLD) continue;
    const key =
      ((buf[i] >> 4) << 8) | ((buf[i + 1] >> 4) << 4) | (buf[i + 2] >> 4);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let bestKey = 0, bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) { bestKey = k; bestCount = c; }
  }
  const domR = ((bestKey >> 8) & 0xF) << 4;
  const domG = ((bestKey >> 4) & 0xF) << 4;
  const domB = (bestKey & 0xF) << 4;

  // 2. Wall mask.
  const isWall = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (buf[i + 3] < ALPHA_THRESHOLD) continue;
      const d =
        Math.abs(buf[i] - domR) +
        Math.abs(buf[i + 1] - domG) +
        Math.abs(buf[i + 2] - domB);
      if (d <= COLOUR_TOLERANCE) isWall[y * w + x] = 1;
    }
  }

  // 3. Flood-fill from edges through non-wall pixels.
  const reached = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, 0, x, h - 1);
  for (let y = 0; y < h; y++) stack.push(0, y, w - 1, y);
  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (reached[idx]) continue;
    if (isWall[idx]) continue;
    reached[idx] = 1;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  // 4. Build the output buffer.
  const out = Buffer.alloc(w * h * 4);
  let whitePx = 0, holePx = 0;
  for (let idx = 0; idx < w * h; idx++) {
    const i = idx * 4;
    const a = buf[i + 3];
    if (a < ALPHA_THRESHOLD) {
      // Transparent → stays transparent (preserve original alpha for soft edges).
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = a;
      continue;
    }
    if (isWall[idx]) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = a;
      whitePx++;
    } else if (reached[idx]) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = a;
      whitePx++;
    } else {
      // Enclosed by walls → transparent hole.
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
      holePx++;
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(
    `✓ ${outputPath}: wall≈rgb(${domR},${domG},${domB}) — white=${whitePx} transparent-holes=${holePx}`
  );
}

main().catch(console.error);
