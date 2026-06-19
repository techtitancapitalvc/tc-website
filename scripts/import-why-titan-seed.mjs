/**
 * One-shot Sanity import — Why Titan Seed section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-why-titan-seed.mjs
 *
 *   Creates (or replaces) the singleton "whyTitanSeed" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-why-titan-seed.mjs"
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

const CARDS = [
  {
    title: "Day One Access",
    desc: "From the moment we invest, you're in 650+ founders, strategic partners, and the Titan entrepreneur network, all at your disposal.",
  },
  {
    title: "Founders Helping Founders",
    desc: "A strong founder community that shares what actually works; playbooks, templates, and hard-won lessons.",
  },
  {
    title: "Warm Introduction",
    desc: "Every introduction we make is personal. Our network picks up for you.",
  },
  {
    title: "Follow-On Opportunity",
    desc: "For companies that break out, we show up again, through our Winners Fund.",
  },
];

const DOC_ID = "whyTitanSeed-singleton";

async function main() {
  console.log("→ Writing whyTitanSeed document...\n");

  const cards = CARDS.map((c, i) => ({
    _key: `${c.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${i}`,
    _type: "whyTitanSeedCard", // MUST match the inline object name in the schema
    title: c.title,
    desc: c.desc,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "whyTitanSeed",
    headingFirst: "Why",
    headingSecond: "Titan Seed",
    cards,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${cards.length} cards populated.`);
  console.log("\nDocument is live. Refresh /titanseedfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
