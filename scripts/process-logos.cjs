/**
 * process-logos.cjs
 *
 * For EVERY logo in /public/images/logos/:
 *  1. Remove white background → transparent
 *  2. Trim to content (zero padding)
 *  3. Stretch width to exactly 400px, scale height proportionally
 *  4. Center vertically on a 400×400 transparent square
 *
 * Result: 400×400 PNG where logo fills left-to-right edge-to-edge.
 *
 * Optional CLI: pass a list of filenames (relative to logos/) to process only those.
 *   node scripts/process-logos.cjs Speakx.webp ans_logo.jpeg contlo.jpeg
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOGOS_DIR = path.join(ROOT, "public/images/logos");
const OUTPUT_DIR = path.join(ROOT, "public/images/portfolio_grid");

const CANVAS = 400;
const WHITE_THRESHOLD = 240;
const NEAR_WHITE = 215;

function removeWhiteBackground(data) {
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i + 1], b = buf[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      buf[i + 3] = 0;
    } else if (r >= NEAR_WHITE && g >= NEAR_WHITE && b >= NEAR_WHITE) {
      const whiteness = Math.min(r, g, b);
      const factor = 1 - (whiteness - NEAR_WHITE) / (WHITE_THRESHOLD - NEAR_WHITE);
      buf[i + 3] = Math.round(buf[i + 3] * Math.max(0, Math.min(1, factor)));
    }
  }
  return buf;
}

async function processLogo(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const baseName = path.basename(inputPath, ext);
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.png`);

  try {
    let pipeline;
    if (ext === ".svg") {
      const svgBuf = fs.readFileSync(inputPath);
      // Fix known corrupt SVGs (ola.svg has bad namespaces)
      let svgStr = svgBuf.toString("utf8");
      svgStr = svgStr
        .replace(/xmlns:\w+="ns_\w+;"\s*/g, "")
        .replace(/<metadata>[\s\S]*?<\/metadata>/g, "");
      pipeline = sharp(Buffer.from(svgStr), { density: 300 });
    } else {
      pipeline = sharp(inputPath);
    }

    // Step 1: Get raw RGBA pixels
    const { data: rawData, info } = await pipeline
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Step 2: Remove white background
    const cleaned = removeWhiteBackground(rawData);

    // Step 3: Trim to content — zero padding
    const trimmed = await sharp(cleaned, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim({ threshold: 10 })
      .png()
      .toBuffer({ resolveWithObject: true });

    const tw = trimmed.info.width;
    const th = trimmed.info.height;

    // Step 4: Resize so WIDTH = CANVAS exactly, height scales proportionally
    const scaledH = Math.round((th / tw) * CANVAS);
    // Cap height to CANVAS (for very tall logos, fit inside instead)
    const finalW = scaledH > CANVAS ? Math.round((tw / th) * CANVAS) : CANVAS;
    const finalH = scaledH > CANVAS ? CANVAS : scaledH;

    const resized = await sharp(trimmed.data)
      .resize(finalW, finalH, { fit: "fill", kernel: "lanczos3" })
      .png()
      .toBuffer();

    // Step 5: Place on CANVAS × CANVAS transparent square, centered
    await sharp({
      create: {
        width: CANVAS,
        height: CANVAS,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{
        input: resized,
        left: Math.round((CANVAS - finalW) / 2),
        top: Math.round((CANVAS - finalH) / 2),
      }])
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    return { ok: true, outputPath };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function main() {
  const VALID_EXTS = new Set([".webp", ".svg", ".png", ".jpeg", ".jpg", ".avif"]);

  // CLI: filenames to process (relative to logos/), else everything in logos/
  const cliArgs = process.argv.slice(2);
  let allFiles;
  if (cliArgs.length > 0) {
    allFiles = cliArgs.filter((f) => VALID_EXTS.has(path.extname(f).toLowerCase()));
    console.log(`Processing ${allFiles.length} explicit file(s) from /images/logos/\n`);
  } else {
    allFiles = fs.readdirSync(LOGOS_DIR)
      .filter((f) => VALID_EXTS.has(path.extname(f).toLowerCase()))
      .sort();
    console.log(`Processing ALL ${allFiles.length} logos from /images/logos/\n`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0, failed = 0;
  const errors = [];

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const inputPath = path.join(LOGOS_DIR, file);
    if (!fs.existsSync(inputPath)) {
      console.log(`[${i + 1}/${allFiles.length}] ${file}... ✗ source not found`);
      errors.push({ name: file, reason: "source not found in logos/" });
      failed++;
      continue;
    }
    process.stdout.write(`[${i + 1}/${allFiles.length}] ${file}...`);

    const result = await processLogo(inputPath);
    if (result.ok) {
      process.stdout.write(` ✓  -> ${path.relative(ROOT, result.outputPath)}\n`);
      success++;
    } else {
      process.stdout.write(` ✗ ${result.reason}\n`);
      errors.push({ name: file, reason: result.reason });
      failed++;
    }
  }

  console.log(`\n✅ ${success} processed, ❌ ${failed} failed.`);
  if (errors.length > 0) {
    console.log("\nFailed:");
    errors.forEach((e) => console.log(`  ${e.name}: ${e.reason}`));
  }

  // Verify: outputs corresponding to processed files should be 400×400
  console.log("\nVerifying dimensions:");
  for (const file of allFiles) {
    const ext = path.extname(file).toLowerCase();
    const outPath = path.join(OUTPUT_DIR, `${path.basename(file, ext)}.png`);
    if (!fs.existsSync(outPath)) continue;
    const m = await sharp(outPath).metadata();
    const ok = m.width === 400 && m.height === 400;
    console.log(`  ${path.basename(outPath)}: ${m.width}×${m.height} ${ok ? "✓" : "✗ WRONG"}`);
  }
}

main().catch(console.error);
