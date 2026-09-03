import { defineField, defineType } from "sanity";

/**
 * Founders Story Page — ONE document holding every story.
 *
 * Same shape as "Our Team Page" and "Blogs Page": a single published document
 * with an array of objects inside it. Editors add, reorder and delete stories
 * in one place, and /foundersstory/[slug] finds its story by looking up the
 * slug in this array.
 *
 * The hero above is its own document — see foundersStoryHero.ts.
 */
export const foundersStoryPage = defineType({
  name: "foundersStoryPage",
  title: "Founders Story Page",
  type: "document",

  fields: [
    /* ─────────── The /foundersstory listing ───────────
       Headings for the Featured band and the grid beneath it. They sit here
       rather than in a separate document so the whole page — its copy, its
       cards and its articles — is one thing to edit. */
    defineField({
      name: "heading",
      title: "Featured band — heading",
      description: 'e.g. "Featured Stories"',
      type: "string",
    }),
    defineField({
      name: "browseLabel",
      title: "Featured band — browse link label",
      type: "string",
    }),
    defineField({
      name: "browseHref",
      title: "Featured band — browse link URL",
      type: "string",
    }),
    defineField({
      name: "gridHeading",
      title: "Grid — heading",
      description:
        'e.g. "Founder Stories". Press Enter for another line — line breaks are kept as typed.',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "ctaLabel",
      title: "Grid — button label",
      type: "string",
    }),

    defineField({
      name: "stories",
      title: "Founder stories",
      description:
        "Every story on the site. Add, reorder or delete them here — each one is also its own page at /foundersstory/<slug>.",
      type: "array",
      of: [{ type: "founderStoryEntry" }],
    }),
  ],

  preview: {
    select: { stories: "stories" },
    prepare: ({ stories }) => ({
      title: "Founders Story Page",
      subtitle: `${(stories as unknown[] | undefined)?.length ?? 0} stories`,
    }),
  },
});
