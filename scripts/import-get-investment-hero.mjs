/**
 * One-shot Sanity import — Get Investment Hero section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-get-investment-hero.mjs
 *
 *   Creates (or replaces) the singleton "getInvestmentHero" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-get-investment-hero.mjs"
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

const DOC_ID = "getInvestmentHero-singleton";

async function main() {
  console.log("→ Writing getInvestmentHero document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "getInvestmentHero",
    headingFirst: "We",
    headingSecond: "Invest Early",
    subtitle:
      "If you\u2019re building something that matters, a company you believe in enough to give the next decade of your life to, we would want to hear about it.",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh /get-investment on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
