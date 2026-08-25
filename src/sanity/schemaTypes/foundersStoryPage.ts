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
