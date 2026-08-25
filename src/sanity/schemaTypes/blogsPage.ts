import { defineField, defineType } from "sanity";

/**
 * Blogs Page — ONE document holding every post.
 *
 * Same shape as "Our Team Page": a single published document with an array of
 * objects inside it, so editors add, reorder and delete posts in one place and
 * /blogs/[slug] finds its post by looking up the slug in this array.
 *
 * The hero above the listing is its own document — see blogsHero.ts.
 */
export const blogsPage = defineType({
  name: "blogsPage",
  title: "Blogs Page",
  type: "document",

  fields: [
    defineField({
      name: "posts",
      title: "Blog posts",
      description:
        "Every post on the site. Add, reorder or delete them here — each one is also its own page at /blogs/<slug>. The listing follows this order, so the post you drag to the top is the one that leads.",
      type: "array",
      of: [{ type: "blogPost" }],
    }),
  ],

  preview: {
    select: { posts: "posts" },
    prepare: ({ posts }) => ({
      title: "Blogs Page",
      subtitle: `${(posts as unknown[] | undefined)?.length ?? 0} posts`,
    }),
  },
});
