/**
 * One-shot Sanity import — Portfolio Winner Fund section (Winners Fund page).
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-portfolio-winner-fund.mjs
 *
 *   WHAT IT DOES:
 *     1. Uploads each company's logo from public/images/... to Sanity
 *     2. Creates (or replaces) the singleton "portfolioWinnerFund" document
 *
 *   REQUIRES:
 *     SANITY_API_WRITE_TOKEN in .env.local (Editor scope)
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-portfolio-winner-fund.mjs"
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

const COMPANIES = [
  { name: "Anveshan", imagePath: "public/images/logos_backup/anveshan.webp", category: "Pure & natural foods", logoW: "65%", logoH: "18%" },
  { name: "BECO", imagePath: "public/images/logos_backup/BECO.webp", category: "Sustainable home products", logoW: "48%", logoH: "80%" },
  { name: "Boba Bhai", imagePath: "public/images/logos_backup/bobabhai-logo.webp", category: "QSR & cloud kitchens", logoW: "52%", logoH: "18%" },
  { name: "Giva", imagePath: "public/images/logos_backup/GIVA.webp", category: "Jewellery and Fashion Accessories", logoW: "33%", logoH: "33%" },
  { name: "HomeRun", imagePath: "public/images/logos_backup/homerun.png", category: "B2B quick commerce", logoW: "70%", logoH: "40%" },
  { name: "MEKR", imagePath: "public/images/logos_backup/mekr-logo.webp", category: "Appliance Manufacturing", logoW: "45%", logoH: "30%" },
  { name: "Mitigata", imagePath: "public/images/logos_backup/mitigata-logo.webp", category: "Full-stack cyber security", logoW: "54%", logoH: "21%" },
  { name: "Simplismart", imagePath: "public/images/logos_backup/Simplismart.webp", category: "AI infrastructure", logoW: "68%", logoH: "28%" },
  { name: "Supertails", imagePath: "public/images/logos_backup/supertails black.png", category: "Pet products marketplace", logoW: "60%", logoH: "26%" },
  { name: "Zouk", imagePath: "public/images/logos_backup/zouk_new_logo.webp", category: "Vegan leather goods", logoW: "40%", logoH: "15%" },
];

const DOC_ID = "portfolioWinnerFund-singleton";

/* ── Helpers ── */
function sanitiseSvg(absPath) {
  let svgStr = fs.readFileSync(absPath, "utf8");
  svgStr = svgStr
    .replace(/xmlns:\w+="ns_\w+;"\s*/g, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "");
  return Buffer.from(svgStr);
}

async function uploadImage(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const buffer = ext === ".svg" ? sanitiseSvg(absPath) : fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  return asset._id;
}

async function main() {
  console.log("→ Uploading Portfolio Winner Fund logos to Sanity...\n");

  const companies = [];

  for (let i = 0; i < COMPANIES.length; i++) {
    const entry = COMPANIES[i];
    const absPath = path.resolve(REPO_ROOT, entry.imagePath);

    if (!fs.existsSync(absPath)) {
      console.log(`  ✗ ${entry.name}: image not found at ${entry.imagePath} — skipping`);
      continue;
    }

    process.stdout.write(`  • ${entry.name.padEnd(20, " ")}`);
    try {
      const assetId = await uploadImage(absPath);
      console.log(` ✓ uploaded`);

      companies.push({
        _key: `company-${i}`,
        _type: "portfolioWinnerCompany",
        name: entry.name,
        category: entry.category,
        logoW: entry.logoW,
        logoH: entry.logoH,
        logo: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      });
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  if (companies.length === 0) {
    console.error("\n✗ No logos uploaded — aborting document write.");
    process.exit(1);
  }

  console.log(`\n→ Writing portfolioWinnerFund document (id: ${DOC_ID})...\n`);

  const doc = {
    _id: DOC_ID,
    _type: "portfolioWinnerFund",
    headingFirst: "Winners Fund",
    headingSecond: "Portfolio Companies",
    companies,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${companies.length} companies populated.`);
  console.log("\nDocument is live. Refresh /winnersfund on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
