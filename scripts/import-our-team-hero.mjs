/**
 * One-shot Sanity import — Our Team Hero (top of /ourteam).
 *
 *   USAGE:
 *     set -a; source .env.local; set +a
 *     node scripts/import-our-team-hero.mjs
 *
 *   Writes (or replaces) the singleton "ourTeamHero" document.
 *   Photos must be uploaded in Studio (under "Our Team — Hero").
 *
 *   Safe to re-run — uses createOrReplace.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with env loaded:\n" +
      "    set -a; source .env.local; set +a; node scripts/import-our-team-hero.mjs"
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

const DOC_ID = "ourTeamHero-singleton";

async function main() {
  const doc = {
    _id: DOC_ID,
    _type: "ourTeamHero",
    titleLine1: "Builders",
    titleLine2: "Backing",
    titleLine3: "Builders",
    description:
      "Titan Capital is led by founders who have lived the journey. Every conversation, every cheque, every late-night call is rooted in that experience.",
    // members images uploaded in Studio
  };

  console.log("→ Writing ourTeamHero singleton...\n");
  const result = await client.createOrReplace(doc);
  console.log(`✓ Document written: ${result._id}`);
  console.log(
    '\nOpen /studio → "Our Team — Hero" to upload the 11 grid photos.\n'
  );
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
