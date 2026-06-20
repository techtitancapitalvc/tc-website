/**
 * One-shot Sanity import — Global Footer.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-footer.mjs
 *
 *   Creates (or replaces) the singleton "footer" document with the same
 *   editorial strings the site shipped with before the Sanity migration.
 *
 *   Pure text — finishes in <1 second. Safe to re-run.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-footer.mjs"
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

const DOC_ID = "footer-singleton";

async function main() {
  console.log("→ Writing footer document...\n");

  const doc = {
    _id: DOC_ID,
    _type: "footer",
    address: "M3M Urbana, Sector 67, Gurugram, India",
    email: "info@titancapital.vc",
    copyright: "© 2026 Titan Capital. All rights reserved.",
    privacyPolicyLabel: "Privacy Policy",
    grievanceLabel: "Grievance Redressal",
    newsletterTitle:
      "Stay close to what founders are building and where markets are moving - with Titan Capital.",
    newsletterPlaceholder: "Email Id",
    newsletterButtonLabel: "Subscribe to Newsletter",
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log("\nDocument is live. Refresh any page on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
