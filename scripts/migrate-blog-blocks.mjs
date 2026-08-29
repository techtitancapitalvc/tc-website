/**
 * Move blog posts from the old `acts` shape onto the composable `blocks` list —
 * the same list the founder stories use.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/migrate-blog-blocks.mjs --dry
 *     node --env-file=.env.local scripts/migrate-blog-blocks.mjs
 *
 * BEFORE  acts[] (eyebrow, title, body, quote, stats, image) + explore*.
 * AFTER   blocks[], one ordered list the editor can rearrange:
 *           content (+ quote, figures, picture) per act -> explore
 *
 * The order it builds is the order the page already rendered, so NOTHING MOVES
 * on the way across — the editor is simply free to move it afterwards.
 *
 * Idempotent: a post that already has blocks is left alone.
 */

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/migrate-blog-blocks.mjs"
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

const key = () => randomUUID().slice(0, 12);

/** One Portable Text paragraph. `bold` is appended as a second, marked span. */
function ptBlock(style, text, bold) {
  const children = [{ _type: "span", _key: key(), text, marks: [] }];
  if (bold) children.push({ _type: "span", _key: key(), text: ` ${bold}`, marks: ["strong"] });
  return { _type: "block", _key: key(), style, markDefs: [], children };
}

const doc = await client.getDocument(PAGE);
if (!doc) {
  console.error(`✗ ${PAGE} not found.`);
  process.exit(1);
}

let changed = 0;
const posts = (doc.posts ?? []).map((post) => {
  if (post.blocks?.length) {
    console.log(`  ${post.slug?.current}: already on blocks — untouched`);
    return post;
  }

  const blocks = [];
  let firstContent = true;

  for (const act of post.acts ?? []) {
    /* The eyebrow and title become the first two lines of the content block,
       at the same levels they rendered at before: eyebrow -> h4 (small grey),
       title -> h3 (level 4). */
    const body = [];
    if (act.eyebrow) body.push(ptBlock("h4", act.eyebrow));
    if (act.title) body.push(ptBlock("h3", act.title));
    const paras = (act.body ?? []).filter(Boolean);
    paras.forEach((p, i) =>
      body.push(ptBlock("normal", p, i === paras.length - 1 ? act.bodyBold : undefined))
    );
    if (body.length) {
      blocks.push({ _type: "storyContent", _key: key(), body, dropCap: firstContent });
      firstContent = false;
    }

    if (act.quote?.text) {
      blocks.push({
        _type: "storyQuote",
        _key: key(),
        text: act.quote.text,
        ...(act.quote.attribution ? { attribution: act.quote.attribution } : {}),
      });
    }

    const stats = (act.stats ?? []).filter((s) => s.num);
    if (stats.length) {
      blocks.push({
        _type: "storyFigures",
        _key: key(),
        stats: stats.map((s) => ({
          _type: "storyFigure",
          _key: key(),
          num: s.num,
          ...(s.label ? { label: s.label } : {}),
        })),
      });
    }

    if (act.image) {
      blocks.push({ _type: "storyPicture", _key: key(), image: act.image });
    }
  }

  if (post.exploreHeading) {
    blocks.push({
      _type: "storyExplore",
      _key: key(),
      heading: post.exploreHeading,
      ...(post.exploreBrowseLabel ? { browseLabel: post.exploreBrowseLabel } : {}),
      ...(post.exploreBrowseHref ? { browseHref: post.exploreBrowseHref } : {}),
    });
  }

  const counts = blocks.reduce((m, b) => ({ ...m, [b._type]: (m[b._type] ?? 0) + 1 }), {});
  console.log(
    `  ${post.slug?.current}: ${blocks.length} blocks — ` +
      Object.entries(counts).map(([k, v]) => `${v}×${k.replace("story", "")}`).join(", ")
  );
  changed++;

  const {
    acts: _a,
    exploreHeading: _eh,
    exploreBrowseLabel: _el,
    exploreBrowseHref: _er,
    ...header
  } = post;
  return { ...header, blocks };
});

console.log(`\n${PAGE}: ${doc.posts?.length ?? 0} post(s), ${changed} to convert`);
if (changed === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}
if (DRY) {
  console.log("(--dry: nothing written)");
  process.exit(0);
}

await client.patch(PAGE).set({ posts }).commit();
console.log(`✓ ${changed} post(s) moved onto blocks.`);
