/**
 * One-shot fix for the HomeRun logo.
 *
 * The lightning bolt is painted black on top of the yellow square. When
 * the portfolio card flips, CSS `brightness(0) invert(1)` turns every
 * opaque pixel white — so the bolt becomes a solid white blob instead of
 * a see-through cutout.
 *
 * This script:
 *   1. Flood-fills the yellow square from a seed pixel to find its bbox
 *   2. Within that bbox, turns every dark pixel transparent (alpha = 0)
 *
 * Pixels outside the square (the black "Home" text below it) are left
 * alone, so the rest of the logo still renders normally.
 *
 *   USAGE: node scripts/knockout-homerun.cjs
 */

const sharp = require("sharp");
const path = require("path");

const TARGET = path.resolve(__dirname, "..", "public/images/portfolio_grid/homerun.png");

const isYellow = (b, i) =>
  b[i + 3] > 100 && b[i] > 200 && b[i + 1] > 150 && b[i + 2] < 100;
const isDark = (b, i) =>
  b[i + 3] > 50 && b[i] < 100 && b[i + 1] < 100 && b[i + 2] < 100;

(async () => {
  const { data, info } = await sharp(TARGET)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);

  // Seed = topmost yellow pixel in the top half.
  let seedX = -1, seedY = -1;
  outer: for (let y = 0; y < h / 2; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (isYellow(buf, i)) {
        seedX = x;
        seedY = y;
        break outer;
      }
    }
  }

  if (seedX < 0) {
    console.error("✗ No yellow seed found. Bailing.");
    process.exit(1);
  }

  // BFS flood-fill across the yellow blob to get its bbox.
  const visited = new Uint8Array(w * h);
  const stack = [[seedX, seedY]];
  let minX = w, maxX = 0, minY = h, maxY = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;
    const i = idx * 4;
    if (!isYellow(buf, i)) continue;
    visited[idx] = 1;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  console.log(`→ Yellow square bbox: (${minX},${minY})–(${maxX},${maxY})`);

  // Knock dark pixels inside the bbox transparent.
  let knocked = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = (y * w + x) * 4;
      if (isDark(buf, i)) {
        buf[i + 3] = 0;
        knocked++;
      }
    }
  }
  console.log(`→ Knocked ${knocked} dark pixels transparent`);

  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(TARGET);

  console.log(`✓ Saved ${path.relative(process.cwd(), TARGET)}`);
})();
