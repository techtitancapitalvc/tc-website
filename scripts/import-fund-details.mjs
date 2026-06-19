/**
 * One-shot Sanity import — Fund Details section (Winners Fund page).
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-fund-details.mjs
 *
 *   Creates (or replaces) the singleton "fundDetails" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-fund-details.mjs"
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

const FUNDS = [
  {
    title: "Fund I Details",
    aifName: "Titan Capital Winners Fund I",
    sebiNumber: "IN/AIF2/23-24/1358",
    category: "Category II AIF",
    fundManager: "Titan Winners Fund Management LLP",
    officeAddress:
      "M3M Urbana Business Park, Sector 67, Golf Course Extension Road, Gurugram  122102",
    bottomLabels: [
      { heading: "Trustee:", value: "Catalyst Trusteeship Limited" },
      { heading: "Sponsors:", value: "TC Sponsor & Services LLP" },
    ],
  },
  {
    title: "Fund II Details",
    aifName: "Titan Capital Winners Fund II",
    sebiNumber: "IN/AIF2/26-27/2125",
    category: "Category II AIF",
    fundManager: "Titan Winners Fund Management LLP",
    officeAddress:
      "M3M Urbana Business Park, Sector 67, Golf Course Extension Road, Gurugram  122102",
    bottomLabels: [
      { heading: "Trustee:", value: "Catalyst Trusteeship Limited" },
      { heading: "Sponsors:", value: "TC Sponsor & Services LLP" },
    ],
  },
];

const DOC_ID = "fundDetails-singleton";

async function main() {
  console.log("→ Writing fundDetails document...\n");

  const funds = FUNDS.map((f, i) => ({
    _key: `fund-${i}`,
    _type: "fundInfo",
    title: f.title,
    aifName: f.aifName,
    sebiNumber: f.sebiNumber,
    category: f.category,
    fundManager: f.fundManager,
    officeAddress: f.officeAddress,
    bottomLabels: f.bottomLabels.map((bl, j) => ({
      _key: `bl-${i}-${j}`,
      _type: "fundBottomLabel",
      heading: bl.heading,
      value: bl.value,
    })),
  }));

  const doc = {
    _id: DOC_ID,
    _type: "fundDetails",
    headingFirst: "Fund",
    headingSecond: "Details",
    funds,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${funds.length} funds populated.`);
  console.log("\nDocument is live. Refresh /winnersfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
