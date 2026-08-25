/**
 * Move blogs and founder stories onto the "Our Team" arrangement.
 *
 *   USAGE:
 *     node --env-file=.env.local scripts/migrate-blogs-and-stories.mjs --dry
 *     node --env-file=.env.local scripts/migrate-blogs-and-stories.mjs
 *
 * BEFORE  one `blogPost` document per post, one `founderStoryPage` document
 *         per company — a flat list of documents in the Studio sidebar.
 *
 * AFTER   four documents in total:
 *           blogsHero-singleton          the hero above the listing
 *           blogsPage-singleton          every post, in a `posts` array
 *           foundersStoryHero-singleton  the hero above the stories
 *           foundersStoryPage-singleton  every story, in a `stories` array
 *
 * Existing content is CARRIED OVER rather than re-authored: each old document
 * becomes one entry in the new array, keeping its image asset references, and
 * only then is the old document deleted. Re-running is safe — entries are
 * matched by slug, so nothing is duplicated and Studio edits to an entry that
 * already exists are left alone.
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
      "  Run with: node --env-file=.env.local scripts/migrate-blogs-and-stories.mjs"
  );
  process.exit(1);
}

const DRY = process.argv.includes("--dry");

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
});

const BLOGS_PAGE = "blogsPage-singleton";
const BLOGS_HERO = "blogsHero-singleton";
const STORY_PAGE = "foundersStoryPage-singleton";
const STORY_HERO = "foundersStoryHero-singleton";

/** Document metadata has no place inside an array entry. */
function toEntry(doc, type) {
  const {
    _id, _type, _rev, _createdAt, _updatedAt, _system, ...rest
  } = doc;
  return { ...rest, _type: type, _key: rest.slug?.current || _id };
}

async function uploadImage(relPath, key) {
  const abs = path.resolve(REPO_ROOT, "public", relPath.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ ${relPath} not found on disk — skipped`);
    return null;
  }
  const asset = await client.assets.upload("image", fs.readFileSync(abs), {
    filename: path.basename(abs),
  });
  return { _type: "image", _key: key, asset: { _type: "reference", _ref: asset._id } };
}

/* ─────────────────────────────────────────────────────────
   1. Read whatever is there today
   ───────────────────────────────────────────────────────── */
const oldPosts = await client.fetch(`*[_type == "blogPost"]`);
const oldStories = await client.fetch(`*[_type == "founderStoryPage"]`);
const blogsPage = await client.getDocument(BLOGS_PAGE);
const storyPage = await client.getDocument(STORY_PAGE);

console.log("Found:");
console.log(`  blogPost documents        ${oldPosts.length}`);
console.log(`  founderStoryPage documents ${oldStories.length}`);
console.log(`  ${BLOGS_PAGE}  ${blogsPage ? `exists, ${blogsPage.posts?.length ?? 0} posts` : "will be created"}`);
console.log(`  ${STORY_PAGE}  ${storyPage ? `exists, ${storyPage.stories?.length ?? 0} stories` : "will be created"}`);

/* Only carry over what is not already in the page document, so a second run
   cannot duplicate an entry or clobber an edit made in the Studio. */
const havePostSlugs = new Set((blogsPage?.posts ?? []).map((p) => p.slug?.current));
const havestorySlugs = new Set((storyPage?.stories ?? []).map((s) => s.slug?.current));

const newPosts = oldPosts
  .filter((d) => !havePostSlugs.has(d.slug?.current))
  .map((d) => toEntry(d, "blogPost"));
const newStories = oldStories
  .filter((d) => !havestorySlugs.has(d.slug?.current))
  /* "founderStoryEntry", not "founderStory" — Impact At A Glance already has
     an inline array member by that name. */
  .map((d) => toEntry(d, "founderStoryEntry"));

console.log("\nWill carry over:");
newPosts.forEach((p) => console.log(`  post   ${p.slug?.current}  ${String(p.title).slice(0, 50)}`));
newStories.forEach((s) => console.log(`  story  ${s.slug?.current}  ${s.company}`));
console.log("\nWill then delete:");
[...oldPosts, ...oldStories].forEach((d) => console.log(`  ${d._id}`));

if (DRY) {
  console.log("\n(--dry: nothing written)");
  process.exit(0);
}

/* ─────────────────────────────────────────────────────────
   2. Heroes — created only if absent, never overwritten
   ───────────────────────────────────────────────────────── */
await client.createIfNotExists({
  _id: BLOGS_HERO,
  _type: "blogsHero",
  headingFirst: "Thinking From The",
  headingSecond: "Titan Ecosystem",
  subtitle:
    "Operator-led insights. Investment theses. Founder stories. Market maps. The playbooks we wish existed when we were building.",
});
console.log(`\n✓ ${BLOGS_HERO}`);

if (!(await client.getDocument(STORY_HERO))) {
  const founderImages = [];
  for (const n of [1, 2, 3, 4]) {
    const img = await uploadImage(`/images/FoundersStory/founder${n}.webp`, `founder-${n}`);
    if (img) founderImages.push(img);
  }
  await client.createIfNotExists({
    _id: STORY_HERO,
    _type: "foundersStoryHero",
    headingLineOne: "A Central Hub",
    headingLineTwo: "For Founders",
    founderImages,
  });
  console.log(`✓ ${STORY_HERO} (${founderImages.length} photos)`);
} else {
  console.log(`✓ ${STORY_HERO} already exists — left alone`);
}

/* ─────────────────────────────────────────────────────────
   3. Page documents — create, then append what is missing
   ───────────────────────────────────────────────────────── */
await client.createIfNotExists({ _id: BLOGS_PAGE, _type: "blogsPage", posts: [] });
await client.createIfNotExists({ _id: STORY_PAGE, _type: "foundersStoryPage", stories: [] });

if (newPosts.length) {
  await client
    .patch(BLOGS_PAGE)
    .setIfMissing({ posts: [] })
    .append("posts", newPosts)
    .commit();
  console.log(`✓ ${BLOGS_PAGE}: +${newPosts.length} post(s)`);
}
if (newStories.length) {
  await client
    .patch(STORY_PAGE)
    .setIfMissing({ stories: [] })
    .append("stories", newStories)
    .commit();
  console.log(`✓ ${STORY_PAGE}: +${newStories.length} story(ies)`);
}

/* ─────────────────────────────────────────────────────────
   4. Remove the old per-item documents
   ───────────────────────────────────────────────────────── */
for (const doc of [...oldPosts, ...oldStories]) {
  await client.delete(doc._id);
  // Drafts are separate documents and outlive their published counterpart.
  await client.delete(`drafts.${doc._id}`).catch(() => {});
  console.log(`✓ deleted ${doc._id}`);
}

/* Written without a `drafts.` prefix, so all four are published already and
   the site reads them as soon as the 60s ISR window turns over. */
console.log("\nDone. Four published documents now hold all of it.");
