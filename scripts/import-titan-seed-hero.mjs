/**
 * One-shot Sanity import — Titan Seed Hero section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-titan-seed-hero.mjs
 *
 *   Creates (or replaces) the singleton "titanSeedHero" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-titan-seed-hero.mjs"
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

const DOC_ID = "titanSeedHero-singleton";

async function main() {
  console.log("→ Writing titanSeedHero document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "titanSeedHero",
    headingFirst: "We Are Your",
    headingSecond: "First Believer",
    subtitle:
      "We back founders when belief matters the most, before the headlines, before the scale, before everyone else catches on.",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh /titanseedfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
