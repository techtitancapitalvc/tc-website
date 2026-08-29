/**
 * Move founder stories from the old fixed sections onto the composable
 * `blocks` list.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/migrate-story-blocks.mjs --dry
 *     node --env-file=.env.local scripts/migrate-story-blocks.mjs
 *
 * BEFORE  facts + acts[] + todayStats[] + explore*, in that fixed order.
 * AFTER   blocks[], one ordered list the editor can rearrange:
 *           fact bar -> content (+ quote) per act -> figures -> explore
 *
 * The order it builds is the order the page used to render, so nothing moves
 * on the way across — the editor is simply free to move it afterwards.
 *
 * Idempotent: a story that already has blocks is left alone.
 */

import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN missing.\n" +
      "  Run with: node --env-file=.env.local scripts/migrate-story-blocks.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const PAGE = "foundersStoryPage-singleton";

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
const stories = (doc.stories ?? []).map((st) => {
  if (st.blocks?.length) {
    console.log(`  ${st.slug?.current}: already on blocks — untouched`);
    return st;
  }

  const blocks = [];

  /* 1. The fact bar, which used to live inside the header. */
  const facts = [
    { label: "Company", value: st.company },
    { label: "Location", value: st.facts?.location },
    { label: "Sector", value: st.facts?.sector },
    { label: "Year", value: st.facts?.year },
  ].filter((f) => f.value);
  if (facts.length || st.facts?.siteUrl) {
    blocks.push({
      _type: "storyFactBar",
      _key: key(),
      facts: facts.map((f) => ({ _type: "storyFact", _key: key(), ...f })),
      ctaLabel: "Visit Site",
      ...(st.facts?.siteUrl ? { ctaUrl: st.facts.siteUrl } : {}),
    });
  }

  /* 2. Each act becomes a content block, plus its quote as its own block —
        which is the whole point: they can now be separated and reordered. */
  let firstContent = true;
  for (const act of st.acts ?? []) {
    const body = [];
    if (act.eyebrow) body.push(ptBlock("h4", act.eyebrow));
    if (act.title) body.push(ptBlock("h3", act.title));
    const paras = (act.body ?? []).filter(Boolean);
    paras.forEach((p, i) =>
      body.push(ptBlock("normal", p, i === paras.length - 1 ? act.bodyBold : undefined))
    );
    if (body.length) {
      blocks.push({
        _type: "storyContent",
        _key: key(),
        body,
        // Only the passage that opens the story gets the drop cap.
        dropCap: firstContent,
      });
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
  }

  /* 3. The figures. */
  const stats = (st.todayStats ?? []).filter((s) => s.num);
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
      ...(st.todayFootnote ? { footnote: st.todayFootnote } : {}),
    });
  }

  /* 4. The explore band. */
  if (st.exploreHeading) {
    blocks.push({
      _type: "storyExplore",
      _key: key(),
      heading: st.exploreHeading,
      ...(st.exploreBrowseLabel ? { browseLabel: st.exploreBrowseLabel } : {}),
      ...(st.exploreBrowseHref ? { browseHref: st.exploreBrowseHref } : {}),
    });
  }

  const counts = blocks.reduce((m, b) => ({ ...m, [b._type]: (m[b._type] ?? 0) + 1 }), {});
  console.log(
    `  ${st.slug?.current}: ${blocks.length} blocks — ` +
      Object.entries(counts).map(([k, v]) => `${v}×${k.replace("story", "")}`).join(", ")
  );
  changed++;

  /* Drop the fields the blocks replace. The header fields stay. */
  const {
    facts: _f,
    acts: _a,
    todayHeading: _th,
    todayStats: _ts,
    todayFootnote: _tf,
    exploreHeading: _eh,
    exploreBrowseLabel: _el,
    exploreBrowseHref: _er,
    ...header
  } = st;
  return { ...header, blocks };
});

console.log(`\n${PAGE}: ${doc.stories?.length ?? 0} story(ies), ${changed} to convert`);
if (changed === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}
if (DRY) {
  console.log("(--dry: nothing written)");
  process.exit(0);
}

await client.patch(PAGE).set({ stories }).commit();
console.log(`✓ ${changed} story(ies) moved onto blocks.`);
