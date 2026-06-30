/**
 * One-shot Sanity import — "Led By Founders" section on /ourteam.
 *
 *   USAGE:
 *     set -a; source .env.local; set +a
 *     node scripts/import-led-by-founders.mjs
 *
 *   WHAT IT DOES:
 *     1. Reads the founders hardcoded below
 *     2. Uploads each portrait from public/images/... to Sanity (when the
 *        file exists on disk — missing files are skipped silently so the
 *        editor can upload them later in Studio)
 *     3. Creates (or replaces) the singleton "ledByFounders" document with
 *        headings + image references all wired up.
 *
 *   AFTER RUNNING:
 *     Open Sanity Studio → "Our Team — Led By Founders"
 *     → click Publish. That's it.
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 *
 *   Safe to re-run — uses createOrReplace.
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

/* ────────────────────────────────────────────────────────
   Sanity client
   ──────────────────────────────────────────────────────── */
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing from environment.\n" +
      "  Run with env loaded:\n" +
      "    set -a; source .env.local; set +a; node scripts/import-led-by-founders.mjs"
  );
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

/* ────────────────────────────────────────────────────────
   Source content — matches the fallback in
   LedByFoundersClient.tsx. Edit text here if you want new
   wording; image paths are relative to /public.
   ──────────────────────────────────────────────────────── */
const HEADING_TOP = "Led By Founders";
const HEADING_BOTTOM = "Who've Walked The Path.";

const FOUNDERS = [
  {
    name: "Kunal Bahl",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/kunalbahl/",
    imagePath: "public/images/kunal-bahl.jpg",
    bio: "Co-founder of Snapdeal, one of India's most iconic e-commerce companies. Kunal brings rare operator insight to every investment, having navigated hyper-growth, deep turbulence, and an enduring rebuild. That experience shapes every conversation he has with founders today. He doesn't advise from theory. He advises from scars.",
    imagePosition: "left",
  },
  {
    name: "Rohit Bansal",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/rohitbansal/",
    imagePath: "public/images/rohit-bansal.jpg",
    bio: "Co-founder of Snapdeal and a deeply technical operator. Rohit brings product depth and business architecture thinking to every portfolio company he touches. His pattern recognition across consumer internet, fintech, and SaaS comes from building, not just investing.",
    imagePosition: "right",
  },
];

/** Stable singleton document ID — re-running the script overwrites it. */
const DOC_ID = "ledByFounders-singleton";

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */
async function uploadImage(absPath) {
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  return asset._id;
}

function makeKey(seed, i) {
  return `${seed.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`;
}

/* ────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────── */
async function main() {
  console.log("→ Uploading founder portraits to Sanity assets...\n");

  const items = [];
  for (let i = 0; i < FOUNDERS.length; i++) {
    const f = FOUNDERS[i];
    const absPath = path.resolve(REPO_ROOT, f.imagePath);
    const item = {
      _key: makeKey(f.name, i),
      _type: "founderProfile",
      name: f.name,
      role: f.role,
      linkedin: f.linkedin,
      bio: f.bio,
      imagePosition: f.imagePosition,
    };

    if (fs.existsSync(absPath)) {
      process.stdout.write(`  • ${f.name.padEnd(18, " ")}`);
      try {
        const assetId = await uploadImage(absPath);
        console.log(` ✓ uploaded`);
        item.image = {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        };
      } catch (err) {
        console.log(` ✗ ${err.message}`);
      }
    } else {
      console.log(
        `  • ${f.name.padEnd(18, " ")} — image not found at ${f.imagePath}, upload later in Studio`
      );
    }

    items.push(item);
  }

  console.log(`\n→ Writing ledByFounders document (id: ${DOC_ID})...\n`);

  const doc = {
    _id: DOC_ID,
    _type: "ledByFounders",
    headingTopHighlight: HEADING_TOP,
    headingBottom: HEADING_BOTTOM,
    founders: items,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${items.length} founders written.`);
  console.log(
    "\nNext: open Sanity Studio → 'Our Team — Led By Founders'\n" +
      "       click Publish (bottom-right). Then refresh /ourteam in your dev server.\n"
  );
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
