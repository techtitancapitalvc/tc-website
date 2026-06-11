/**
 * normalize-logos.mjs
 *
 * Normalizes all raster logos to a consistent 400×250 canvas:
 *   1. Resizes each logo to fit within a 360×210 box (preserving aspect ratio)
 *   2. Centers it on a 400×250 TRANSPARENT canvas (white for JPEG since it has no alpha)
 *   3. Overwrites the original file (same name, same format)
 *
 * Transparent canvas is critical — some logos are displayed with CSS filters
 * like `brightness-0 invert` on dark backgrounds (e.g. BackedEarly section).
 * A white canvas would turn black under invert, breaking those layouts.
 *
 * SVGs are skipped (they're vector and scale perfectly).
 *
 * Run: node scripts/normalize-logos.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const LOGOS_DIR = path.resolve("public/images/logos");

// Canvas dimensions
const CANVAS_W = 400;
const CANVAS_H = 250;

// Max logo area inside canvas (leaves ~20px padding on each side)
const MAX_LOGO_W = 360;
const MAX_LOGO_H = 210;

// Raster extensions to process
const RASTER_EXT = new Set([".webp", ".png", ".jpeg", ".jpg", ".avif"]);

// Formats that support alpha channel
const ALPHA_FORMATS = new Set([".webp", ".png", ".avif"]);

async function processLogo(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER_EXT.has(ext)) return null; // skip SVGs etc.

  const filename = path.basename(filePath);
  const supportsAlpha = ALPHA_FORMATS.has(ext);

  try {
    // Read original
    const inputBuffer = fs.readFileSync(filePath);
    const metadata = await sharp(inputBuffer).metadata();
    const { width: origW, height: origH } = metadata;

    if (!origW || !origH) {
      return { file: filename, status: "skipped", reason: "no dimensions" };
    }

    // Calculate scale to fit within MAX_LOGO_W × MAX_LOGO_H
    const scaleW = MAX_LOGO_W / origW;
    const scaleH = MAX_LOGO_H / origH;
    const scale = Math.min(scaleW, scaleH);

    // Target logo size (rounded to integers)
    const logoW = Math.round(origW * scale);
    const logoH = Math.round(origH * scale);

    // Resize the logo to target size, keeping alpha if present
    const resized = await sharp(inputBuffer)
      .resize(logoW, logoH, { fit: "inside", withoutEnlargement: false })
      .toBuffer();

    // Compute centering offsets
    const left = Math.round((CANVAS_W - logoW) / 2);
    const top = Math.round((CANVAS_H - logoH) / 2);

    // Create canvas — transparent for alpha-capable formats, white for JPEG
    const canvasSharp = sharp({
      create: {
        width: CANVAS_W,
        height: CANVAS_H,
        channels: supportsAlpha ? 4 : 3,
        background: supportsAlpha
          ? { r: 0, g: 0, b: 0, alpha: 0 }   // fully transparent
          : { r: 255, g: 255, b: 255 },        // white (JPEG fallback)
      },
    }).composite([{ input: resized, left, top }]);

    // Encode in original format
    let outputBuffer;
    if (ext === ".png") {
      outputBuffer = await canvasSharp.png({ quality: 90 }).toBuffer();
    } else if (ext === ".jpeg" || ext === ".jpg") {
      outputBuffer = await canvasSharp.jpeg({ quality: 90 }).toBuffer();
    } else if (ext === ".avif") {
      outputBuffer = await canvasSharp.avif({ quality: 80 }).toBuffer();
    } else {
      // Default: webp
      outputBuffer = await canvasSharp.webp({ quality: 85 }).toBuffer();
    }

    // Overwrite original
    fs.writeFileSync(filePath, outputBuffer);

    return {
      file: filename,
      status: "ok",
      original: `${origW}×${origH}`,
      logo: `${logoW}×${logoH}`,
      canvas: `${CANVAS_W}×${CANVAS_H}`,
      alpha: supportsAlpha,
      sizeKB: Math.round(outputBuffer.length / 1024),
    };
  } catch (err) {
    return { file: filename, status: "error", reason: err.message };
  }
}

async function main() {
  const files = fs.readdirSync(LOGOS_DIR).sort();
  console.log(`\nFound ${files.length} files in logos/\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let alphaCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!RASTER_EXT.has(ext)) {
      skipped++;
      continue;
    }

    const fullPath = path.join(LOGOS_DIR, file);
    const result = await processLogo(fullPath);

    if (!result) {
      skipped++;
    } else if (result.status === "ok") {
      processed++;
      if (result.alpha) alphaCount++;
      if (processed <= 10 || processed % 50 === 0) {
        console.log(`  ✓ ${result.file}: ${result.original} → ${result.logo} on ${result.canvas} ${result.alpha ? "(transparent)" : "(white)"} (${result.sizeKB}KB)`);
      }
    } else {
      errors++;
      console.log(`  ✗ ${result.file}: ${result.reason}`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Processed: ${processed}`);
  console.log(`    Transparent canvas: ${alphaCount}`);
  console.log(`    White canvas (JPEG): ${processed - alphaCount}`);
  console.log(`  Skipped (SVG/other): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Canvas: ${CANVAS_W}×${CANVAS_H}px`);
  console.log(`  Logo area: ${MAX_LOGO_W}×${MAX_LOGO_H}px (centered)`);
  console.log(`═══════════════════════════════════════\n`);
}

main();
