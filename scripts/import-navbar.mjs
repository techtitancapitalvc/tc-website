/**
 * One-shot Sanity import — Global Navbar.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-navbar.mjs
 *
 *   Creates (or replaces) the singleton "navbar" document with the same
 *   sections, sub-items, URLs, and CTA the site shipped with before the
 *   Sanity migration.
 *
 *   Pure text — finishes in <1 second. Safe to re-run.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-navbar.mjs"
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

const DOC_ID = "navbar-singleton";

async function main() {
  console.log("→ Writing navbar document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "navbar",
    sections: [
      {
        _key: "for-founders",
        _type: "navbarSection",
        id: "for-founders",
        title: "FOR FOUNDERS",
        subItems: [
          { _key: "get-investment", _type: "navbarSubItem", label: "Get Investment", url: "/getinvestment" },
          { _key: "titan-seed-fund", _type: "navbarSubItem", label: "Titan Seed Fund", url: "/titanSeedFund" },
          { _key: "titan-winners-fund", _type: "navbarSubItem", label: "Titan Winners Fund", url: "/winnersFund" },
        ],
      },
      {
        _key: "portfolio",
        _type: "navbarSection",
        id: "portfolio",
        title: "PORTFOLIO",
        directUrl: "/portfolio",
        subItems: [],
      },
    ],
    ctaLabel: "Get Investment",
    ctaUrl: "/getinvestment",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh any page on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
