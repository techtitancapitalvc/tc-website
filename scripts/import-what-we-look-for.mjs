/**
 * One-shot Sanity import — What We Look For section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-what-we-look-for.mjs
 *
 *   Creates (or replaces) the singleton "whatWeLookFor" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-what-we-look-for.mjs"
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

const ITEMS = [
  {
    title: "A founder with genuine insight.",
    desc: "You understand your customer's problem better than anyone. Not just from research, but from experience, obsession, or lived reality.",
  },
  {
    title: "A differentiated approach.",
    desc: "Technology, distribution, or business model edge. Something that makes your company structurally hard to copy.",
  },
  {
    title: "Ambition to build a lasting, enduring business.",
    desc: "Building for 10 years, not for the next fundraise. Something that outlasts any one cycle.",
  },
  {
    title: "Integrity and coachability.",
    desc: "We'll push you, challenge you, and occasionally disagree with you. We need founders who can handle that, and push back when they're right.",
  },
];

const DOC_ID = "whatWeLookFor-singleton";

async function main() {
  console.log("→ Writing whatWeLookFor document...\n");

  const items = ITEMS.map((it, i) => ({
    _key: `lookfor-${i}`,
    _type: "lookForItem", // MUST match the inline object name in the schema
    title: it.title,
    desc: it.desc,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "whatWeLookFor",
    headingFirst: "What We",
    headingSecond: "Look For",
    items,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${items.length} items populated.`);
  console.log("\nDocument is live. Refresh /titanseedfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
