/**
 * Seed the first founderStoryPage document — Mamaearth.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/seed-founder-story-mamaearth.mjs --dry
 *     node --env-file=.env.local scripts/seed-founder-story-mamaearth.mjs
 *
 * Uses createIfNotExists, so re-running never overwrites edits made in the
 * Studio. Delete the document first if you want to re-seed from scratch.
 *
 * Content is transcribed from the design, plus the copy that used to be
 * hardcoded in src/app/foundersstory/[slug]/page.tsx. That file is now
 * entirely Sanity-driven, which is why this seed exists: without a document
 * the route renders its "not published yet" state.
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
      "  Run with: node --env-file=.env.local scripts/seed-founder-story-mamaearth.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const DOC_ID = "founderStoryPage-mamaearth";
const HERO = "/images/FoundersStory/mamaearth-founders.webp";

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

const BODY = [
  "In Late 2015, Ghazal And Varun Alagh's First Son, Agastya, Developed Severe Skin Allergies. They Did What Every New Parent Does — Went Looking For Safe, Toxin-Free Baby Products. What They Found Was A Market That Didn't Have Them. Every Product They Tried Was Loaded With Chemicals That Weren't Safe For A Baby's Sensitive Skin.",
  "Varun Was A Senior Marketer At Coca-Cola, Where He'd Built The Brand Across India, Nepal, Bangladesh, And Sri Lanka. Ghazal Had Spent Years In Technology And Art. Neither Had Built A Consumer Brand. Both Decided That Didn't Matter.",
  "In November 2016, They Walked Away From Their Careers And Launched Mamaearth From Their Home In Gurugram —",
];

const doc = {
  _id: DOC_ID,
  _type: "founderStoryPage",
  slug: { _type: "slug", current: "mamaearth" },
  company: "Mamaearth",
  tags: ["D2C", "Consumer Brand", "IPO 2023"],
  headline:
    "A Baby's Allergy Sent Us Looking For Safe Products. We Couldn't Find Them, So We Built Them",
  founders: "Ghazal & Varun Alagh",
  facts: {
    location: "India",
    /* The design mock reads "Mamaearth" here, which is placeholder text
       repeating the company name — the label above it is Sector. */
    sector: "Consumer Brand",
    year: "2018",
    siteUrl: "https://mamaearth.in",
  },
  acts: [
    {
      _type: "storyAct",
      _key: "act-1",
      eyebrow: "Act I Before Titan",
      title: "Before.",
      body: BODY,
      bodyBold:
        "With ₹25 Lakhs, Seven Products, And The Conviction That Indian Parents Deserved Better.",
      quote: {
        text: "Every Product They Tried Was Loaded With Chemicals That Weren't Safe For A Baby's Sensitive Skin.",
        attribution: "Ghazal And Varun Alagh's",
      },
    },
  ],
  todayHeading: "Mamaearth Consumer, Today",
  todayStats: [
    { _type: "todayStat", _key: "s1", num: "101X", label: "Return on Titan's seed cheque" },
    { _type: "todayStat", _key: "s2", num: "2,023", label: "Listed on BSE & NSE" },
    { _type: "todayStat", _key: "s3", num: "6", label: "Brands under Honasa" },
    { _type: "todayStat", _key: "s4", num: "8X", label: "Revenue growth,\nFY20–FY22" },
  ],
  todayFootnote:
    "Figures From Publicly Available Filings & Disclosures (Honasa Consumer Ltd.).",
  exploreHeading: "Explore Stories",
  exploreBrowseLabel: "Browse all stories",
  exploreBrowseHref: "/foundersstory",
};

const existing = await client.getDocument(DOC_ID);
console.log(`Document "${DOC_ID}": ${existing ? "ALREADY EXISTS — will not be touched" : "will be created"}`);
console.log(`  company   ${doc.company}`);
console.log(`  headline  ${doc.headline.slice(0, 60)}…`);
console.log(`  acts      ${doc.acts.length}`);
console.log(`  stats     ${doc.todayStats.length}`);

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}
if (existing) {
  console.log("\nNothing to do.");
  process.exit(0);
}

const abs = path.resolve(REPO_ROOT, "public", HERO.replace(/^\//, ""));
if (fs.existsSync(abs)) {
  const asset = await client.assets.upload("image", fs.readFileSync(abs), {
    filename: path.basename(abs),
  });
  doc.heroImage = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  console.log(`\n  ✓ uploaded ${HERO}`);
} else {
  console.warn(`\n  ⚠ ${HERO} not found on disk — add the hero image in Studio.`);
}

await client.createIfNotExists(doc);
console.log(`\n✓ Created ${DOC_ID}. Open it in Studio and Publish.`);
