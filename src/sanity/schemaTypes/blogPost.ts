import { defineField, defineType } from "sanity";
import { STORY_BLOCK_TYPES } from "./storyBlocks";

/**
 * One blog post — an OBJECT, not a document.
 *
 * Posts live inside the single "Blogs Page" document (see blogsPage.ts), the
 * same way team members live inside "Our Team Page". Editors add, reorder and
 * delete posts from one place rather than hunting through a flat list of
 * documents, and the listing order is simply the array order.
 *
 * The one object feeds BOTH surfaces:
 *
 *   /blogs          the card — cover, tags, meta line, title, excerpt
 *   /blogs/[slug]   the article — that same header, then the acts
 *
 * so a card can never drift from the post it links to.
 *
 * THE HEADER IS FIXED, THE REST IS A LIST. Title, one-liner and cover image
 * open every article; everything after them lives in `blocks`, the same
 * ordered list the founder stories use, composed and reordered freely. See
 * storyBlocks.ts for what can go in it.
 */
export const blogPost = defineType({
  name: "blogPost",
  title: "Blog post",
  type: "object",

  groups: [
    { name: "card", title: "Card & header" },
    { name: "article", title: "Article" },
  ],

  fields: [
    /* ─────────── Card + article header ─────────── */
    defineField({
      name: "title",
      title: "Title",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
      group: "card",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /blogs/<slug>)",
      description:
        'Just the last part of the address, no slashes: "boba-bhai", NOT "/boba-bhai".',
      type: "slug",
      options: {
        source: "title",
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
          .error("Slug is required for the article URL")
          /* A slug typed with a slash builds "/blogs//boba-bhai", which is not
             a route — the page 404s and the card looks broken. */
          .custom((v) =>
            v?.current && /[/\s]/.test(v.current)
              ? 'Remove the slash — write "boba-bhai", not "/boba-bhai".'
              : true
          ),
      group: "card",
    }),
    defineField({
      name: "excerpt",
      title: "One-line description",
      description: "Shown under the title on both the card and the article.",
      type: "text",
      rows: 3,
      group: "card",
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      group: "card",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "The pills on the card.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "card",
    }),
    defineField({ name: "author", title: "Author", type: "string", group: "card" }),
    defineField({
      name: "readTime",
      title: "Read time",
      description: 'e.g. "12 Min Read".',
      type: "string",
      group: "card",
    }),
    defineField({ name: "category", title: "Category", type: "string", group: "card" }),
    defineField({
      name: "publishedAt",
      title: "Published",
      description: "Shown on the card. Newest first on the listing.",
      type: "datetime",
      group: "card",
    }),
    defineField({
      name: "featured",
      title: "Feature on the listing",
      description:
        "The first featured post takes the large card; the next two take the pair beside it. Everything else falls into the grid.",
      type: "boolean",
      initialValue: false,
      group: "card",
    }),

    /* ─────────── Article ─────────── */
    defineField({
      name: "blocks",
      title: "Article",
      description:
        "Everything below the header, in order. The SAME blocks the founder stories use — add whichever the piece needs and drag them into the order you want.",
      type: "array",
      group: "article",
      of: STORY_BLOCK_TYPES,
    }),
  ],

  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
