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

const DOC_ID = "winnersHero-singleton";

async function main() {
  console.log("→ Writing winnersHero document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "winnersHero",
    headingFirst: "Doubling Down On",
    headingSecond: "Breakout Companies",
    subtitle:
      "The Titan Capital Winners Fund backs the companies in our portfolio that have already proven themselves, and are ready to own their category.",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh /titanseedfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
