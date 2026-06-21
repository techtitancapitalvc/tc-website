/**
 * Knock out interior content from a filled-background logo.
 *
 * For "monogram" logos (solid coloured tile + glyph on top) the post-flip
 * CSS `brightness(0) invert(1)` turns every opaque pixel white and the
 * glyph disappears into the silhouette.
 *
 * Algorithm: enclosure-based flood fill.
 *   1. Pick a "wall" colour (default = dominant opaque colour, override
 *      via --bg=R,G,B).
 *   2. Flood-fill from the four image corners through every pixel that is
 *      NOT a wall (transparent OR opaque-but-not-wall-coloured).
 *   3. Any non-wall opaque pixel NOT reached by the flood is enclosed by
 *      walls — that's the interior content. Set its alpha to 0.
 *
 * Standalone glyphs sitting on the canvas's transparent background (e.g.
 * the "Home" wordmark below the HomeRun tile) are reachable from the
 * outside, so they are preserved.
 *
 *   USAGE:
 *     node scripts/knockout-interior.cjs <path-to-png> [--bg=R,G,B]
 *     node scripts/knockout-interior.cjs foo.png bar.png baz.png
 */

const sharp = require("sharp");
const fs = require("fs");

const COLOUR_TOLERANCE = 80;   // R+G+B distance to count as wall colour
const ALPHA_THRESHOLD = 200;   // pixel counted as opaque

function parseBgFlag(args) {
  for (const a of args) {
    const m = a.match(/^--bg=(\d+),(\d+),(\d+)$/);
    if (m) return [+m[1], +m[2], +m[3]];
  }
  return null;
}

async function processFile(file, forcedBg) {
  if (!fs.existsSync(file)) {
    console.error(`✗ not found: ${file}`);
    return;
  }

  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  // 1. Determine wall colour.
  let domR, domG, domB;
  if (forcedBg) {
    [domR, domG, domB] = forcedBg;
  } else {
    const counts = new Map();
    for (let i = 0; i < buf.length; i += 4) {
      if (buf[i + 3] < ALPHA_THRESHOLD) continue;
      const key =
        ((buf[i] >> 4) << 8) | ((buf[i + 1] >> 4) << 4) | (buf[i + 2] >> 4);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    if (counts.size === 0) {
      console.log(`- ${file}: fully transparent, skipping`);
      return;
    }
    let bestKey = 0, bestCount = 0;
    for (const [k, c] of counts) {
      if (c > bestCount) { bestKey = k; bestCount = c; }
    }
    domR = ((bestKey >> 8) & 0xF) << 4;
    domG = ((bestKey >> 4) & 0xF) << 4;
    domB = (bestKey & 0xF) << 4;
  }

  // 2. Wall mask = opaque pixels near wall colour.
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

  // 3. Flood-fill "outside" from all four corners through non-wall pixels.
  const reached = new Uint8Array(w * h);
  const stack = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
  ];
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (reached[idx]) continue;
    if (isWall[idx]) continue;
    reached[idx] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // 4. Knock out: opaque, non-wall, NOT reached → enclosed → transparent.
  let knocked = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i = idx * 4;
      if (buf[i + 3] < ALPHA_THRESHOLD) continue;
      if (isWall[idx]) continue;
      if (reached[idx]) continue;
      buf[i + 3] = 0;
      knocked++;
    }
  }

  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(file);

  console.log(
    `✓ ${file}: wall≈rgb(${domR},${domG},${domB}) — knocked ${knocked} enclosed pixels`
  );
}

(async () => {
  const args = process.argv.slice(2);
  const forcedBg = parseBgFlag(args);
  const files = args.filter((a) => !a.startsWith("--"));
  if (files.length === 0) {
    console.error("Usage: node scripts/knockout-interior.cjs <file> [--bg=R,G,B]");
    process.exit(1);
  }
  for (const f of files) {
    await processFile(f, forcedBg);
  }
})();
