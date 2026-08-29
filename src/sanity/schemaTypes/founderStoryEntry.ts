import { defineField, defineType } from "sanity";
import { STORY_BLOCK_TYPES } from "./storyBlocks";

/**
 * One founder story — an OBJECT, not a document.
 *
 * Stories live inside the single "Founders Story Page" document (see
 * foundersStoryPage.ts), the same way team members live inside "Our Team
 * Page". /foundersstory/[slug] finds its story by looking up the slug in that
 * array, so adding a story is one entry in one place rather than a new
 * document to create and remember to publish.
 *
 * THE HEADER IS FIXED, THE REST IS A LIST. Tags, headline, founders and hero
 * image are the story's identity — every story opens the same way, so letting
 * them be dragged around would let one open on a quote and another on a photo.
 * Everything after them lives in `blocks`, an ordered list the editor composes
 * and reorders freely. See storyBlocks.ts for what can go in it.
 */
export const founderStoryEntry = defineType({
  /* NOT "founderStory": the Impact At A Glance singleton already has an inline
     array member by that name, and two schema types sharing one name means
     Sanity can hand this schema's fields to that section's data. */
  name: "founderStoryEntry",
  title: "Founder Story",
  type: "object",

  groups: [
    { name: "header", title: "1 · Header" },
    { name: "story", title: "2 · Story" },
  ],

  fields: [
    /* ─────────── 1. HEADER ─────────── */
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (r) => r.required(),
      group: "header",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /foundersstory/<slug>)",
      description:
        'Just the last part of the address, no slashes: "mamaearth" for /foundersstory/mamaearth.',
      type: "slug",
      options: {
        source: "company",
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      validation: (r) =>
        r
          .required()
          .error("Slug is required for the story URL")
          /* A slug typed with a slash builds "/foundersstory//mamaearth",
             which is not a route — the page 404s. */
          .custom((v) =>
            v?.current && /[/\s]/.test(v.current)
              ? 'Remove the slash — write "mamaearth", not "/mamaearth".'
              : true
          ),
      group: "header",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: 'The pills above the headline, e.g. "D2C", "IPO 2023".',
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "header",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      description: "The big title. This is the story, not the company name.",
      type: "text",
      rows: 3,
      group: "header",
    }),
    defineField({
      name: "founders",
      title: "Founders",
      description:
        'e.g. "Ghazal & Varun Alagh". The company is appended after a dash automatically.',
      type: "string",
      group: "header",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      group: "header",
    }),
    /* ─────────── 2. THE STORY ─────────── */
    defineField({
      name: "blocks",
      title: "Story",
      description:
        "Everything below the header, in order. Add whichever blocks the story needs and drag them into the order you want — a fact bar part way down, two quotes in a row, figures before the copy rather than after.",
      type: "array",
      group: "story",
      of: STORY_BLOCK_TYPES,
    }),
  ],

  preview: {
    select: { title: "company", subtitle: "headline", media: "heroImage" },
  },
});
