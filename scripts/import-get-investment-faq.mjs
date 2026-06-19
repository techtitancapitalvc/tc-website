/**
 * One-shot Sanity import — Get Investment FAQ section.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/import-get-investment-faq.mjs
 *
 *   Creates (or replaces) the singleton "getInvestmentFAQ" document.
 *   No images — pure text — finishes in <1 second.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/import-get-investment-faq.mjs"
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

const FAQS = [
  {
    id: "faq-1",
    question: "Do I need a deck to apply?",
    answer:
      "No. A short email or 6-field form is enough to get started. If there's mutual interest, we'll ask for more at the right time.",
  },
  {
    id: "faq-2",
    question: "What stage do you invest at?",
    answer:
      "Pre-seed and seed. We prefer to be your first institutional investor, and for breakout companies, we follow on in later rounds through the Winners Fund.",
  },
  {
    id: "faq-3",
    question: "How long does the process take?",
    answer:
      "We move fast. Most founders hear back from us within days, not weeks.",
  },
  {
    id: "faq-5",
    question: "What happens after you invest?",
    answer:
      "You get full access to the Titan network, ecosystem, and team. The first year as a Titan portfolio company is the most important, we work closely with you on hiring, GTM strategy, and setting up your next fundraise.",
  },
];

const DOC_ID = "getInvestmentFAQ-singleton";

async function main() {
  console.log("→ Writing getInvestmentFAQ document...\n");

  const items = FAQS.map((faq, i) => ({
    _key: `${faq.id}-${i}`,
    _type: "faqItem",
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  }));

  const doc = {
    _id: DOC_ID,
    _type: "getInvestmentFAQ",
    headingFirst: "You've Got Questions",
    headingSecond: "We've Got Answers",
    items,
  };

  const result = await client.createOrReplace(doc);

  console.log(`✓ Document written: ${result._id}`);
  console.log(`  ${items.length} FAQ items populated.`);
  console.log("\nDocument is live. Refresh /get-investment on your dev server.\n");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err);
  process.exit(1);
});
