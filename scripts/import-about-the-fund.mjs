/**
 * One-shot Sanity import — About The Fund section (Winners Fund page).
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-about-the-fund.mjs
 *
 *   Creates (or replaces) the singleton "aboutTheFund" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-about-the-fund.mjs"
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

const PARAGRAPHS = [
  "We've been with these founders since the beginning, through the early decisions, the difficult pivots, and the milestones that quietly signalled something bigger was being built.",
  "The Winners Fund is our commitment to seeing it through. When a portfolio company demonstrates exceptional momentum and a credible path to category leadership, we return with greater capital and deeper conviction.",
  "Continuity of belief is a form of value in itself, and that is what the Winners Fund represents.",
];

const PILLS = [
  { id: "vision", label: "Vision", type: "pill", rotate: 0, x: 0, y: 0 },
  { id: "founders", label: "Founders", type: "pill", rotate: 0, x: -4.0, y: 3.0 },
  { id: "scale", label: "Scale", type: "pill", rotate: -10, x: 5.2, y: 3.4 },
  { id: "mentorship", label: "Mentorship", type: "pill", rotate: 8, x: -6.0, y: 6.6 },
  { id: "growth", label: "Growth", type: "pill", rotate: 8, x: 4.4, y: 7.2 },
  { id: "dot1", label: "", type: "dot", rotate: 0, x: -8.0, y: 10.0 },
  { id: "network", label: "Network", type: "pill", rotate: 0, x: 0, y: 10.2 },
  { id: "dot2", label: "", type: "dot", rotate: 0, x: 8.0, y: 10.0 },
  { id: "partnership", label: "Partnership", type: "pill", rotate: 0, x: -5.0, y: 13.2 },
  { id: "momentum", label: "Momentum", type: "pill", rotate: 0, x: 5.0, y: 13.2 },
  { id: "innovation", label: "Innovation", type: "pill", rotate: 12, x: -10.0, y: 16.4 },
  { id: "leadership", label: "Leadership", type: "pill", rotate: 0, x: 0, y: 16.6 },
  { id: "execution", label: "Execution", type: "pill", rotate: -12, x: 10.0, y: 16.4 },
  { id: "success", label: "Success", type: "pill", rotate: 0, x: 0, y: 20.0 },
  { id: "dot3", label: "", type: "dot", rotate: 0, x: 0, y: 24.0 },
];

const DOC_ID = "aboutTheFund-singleton";

async function main() {
  console.log("→ Writing aboutTheFund document...\n");

  const pills = PILLS.map((p, i) => ({
    _key: `${p.id}-${i}`,
    _type: "aboutTheFundPill",
    id: p.id,
    label: p.label,
    type: p.type,
    rotate: p.rotate,
    x: p.x,
    y: p.y,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "aboutTheFund",
    headingFirst: "About The",
    headingSecond: "Fund",
    paragraphs: PARAGRAPHS,
    pills,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${PARAGRAPHS.length} paragraphs, ${pills.length} pills populated.`);
  console.log("\nDocument is live. Refresh /winnersfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
