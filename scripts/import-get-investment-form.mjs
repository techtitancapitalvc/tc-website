/**
 * One-shot Sanity import — Get Investment Form section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-get-investment-form.mjs
 *
 *   Creates (or replaces) the singleton "getInvestmentForm" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-get-investment-form.mjs"
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

const DOC_ID = "getInvestmentForm-singleton";

async function main() {
  console.log("→ Writing getInvestmentForm document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "getInvestmentForm",
    section1Label: "About You",
    section1Title: "The Founder",
    section1Subtitle: "We invest in people first. Tell us who you are.",
    section2Label: "The Company",
    section2Title: "What Are You Building?",
    section2Subtitle: "",
    submitButtonLabel: "Submit Application",
    successTitle: "Application submitted",
    successMessage: "We read every application. You'll hear from us soon.",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh /get-investment on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
