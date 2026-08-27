/**
 * Move blog posts from the old `sections` shape onto `acts`.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/migrate-blog-acts.mjs --dry
 *     node --env-file=.env.local scripts/migrate-blog-acts.mjs
 *
 * BEFORE  sections[] + closingSections[] + a page-level stats band + a closing
 *         image, all fixed in that order.
 * AFTER   acts[], each with its own optional pull quote, figures strip and
 *         picture, so they land where the piece wants them.
 *
 * The old fields are removed once their content has been carried across, and
 * the explore band is given its copy. Idempotent: a post that already has acts
 * is left alone.
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/migrate-blog-acts.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const PAGE = "blogsPage-singleton";

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

/** Eyebrows, in order, for however many acts a post turns out to have. */
const EYEBROWS = [
  "Act I The Thesis",
  "Act II The Pattern",
  "Act III What It Taught Us",
  "Act IV In Practice",
  "Act V Today",
];

const doc = await client.getDocument(PAGE);
if (!doc) {
  console.error(`✗ ${PAGE} not found. Run migrate-blogs-and-stories.mjs first.`);
  process.exit(1);
}

const posts = doc.posts ?? [];
console.log(`${PAGE}: ${posts.length} post(s)\n`);

let changed = 0;
const next = posts.map((p) => {
  if (p.acts?.length) {
    console.log(`  ${p.slug?.current}: already on acts — untouched`);
    return p;
  }

  const old = [...(p.sections ?? []), ...(p.closingSections ?? [])].filter(
    (s) => s.subheading || s.body?.length
  );
  if (old.length === 0) {
    console.log(`  ${p.slug?.current}: nothing to carry over`);
    return p;
  }

  const stats = (p.stats ?? []).filter((s) => s.num);
  const acts = old.map((s, i) => {
    const act = {
      _type: "blogAct",
      _key: `act-${i + 1}`,
      eyebrow: EYEBROWS[i] ?? `Act ${i + 1}`,
      title: s.subheading,
      body: s.body,
      bodyBold: s.bodyBold,
    };
    /* The figures went at the end of the article before; they belong to the
       LAST act now, which is where the design puts them. */
    if (i === old.length - 1 && stats.length) {
      act.stats = stats.map((s2, k) => ({
        _type: "blogStat",
        _key: `stat-${k + 1}`,
        num: s2.num,
        label: s2.label,
      }));
    }
    /* The closing image belonged to the article; hang it on the first act, so
       it still breaks up the opening run of copy. */
    if (i === 0 && p.closingImage) act.image = p.closingImage;
    return act;
  });

  console.log(
    `  ${p.slug?.current}: ${old.length} section(s) -> ${acts.length} act(s)` +
      `${stats.length ? `, ${stats.length} figures on the last` : ""}` +
      `${p.closingImage ? ", closing image onto act 1" : ""}`
  );
  changed++;

  const {
    sections: _s,
    closingSections: _c,
    closingImage: _ci,
    stats: _st,
    statsHeading: _sh,
    statsFootnote: _sf,
    ...rest
  } = p;
  return {
    ...rest,
    acts,
    exploreHeading: p.exploreHeading ?? "Explore Blog",
    exploreBrowseLabel: p.exploreBrowseLabel ?? "Browse all stories",
    exploreBrowseHref: p.exploreBrowseHref ?? "/blogs",
  };
});

if (changed === 0) {
  console.log("\nNothing to do.");
  process.exit(0);
}
if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}

await client.patch(PAGE).set({ posts: next }).commit();
console.log(`\n✓ ${changed} post(s) moved onto acts.`);
