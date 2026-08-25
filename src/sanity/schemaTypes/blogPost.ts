import { defineField, defineType } from "sanity";

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
 *   /blogs/[slug]   the article — that same header plus body, stats, closing image
 *
 * so a card can never drift from the post it links to.
 *
 * EVERY PART OF THE ARTICLE IS OPTIONAL and hides itself when empty: a post
 * with no stats has no stats band, one with no closing image ends on its last
 * paragraph. That is why almost nothing here is `required` — marking fields
 * required would force editors to fill in parts of a layout they do not want
 * on that post.
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
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required().error("Slug is required for the article URL"),
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

    /* ─────────── Article body ─────────── */
    defineField({
      name: "sections",
      title: "Body sections",
      description:
        "Add as many as the post needs. A section with no heading is just a paragraph; one with no body is just a heading.",
      type: "array",
      group: "article",
      of: [
        {
          type: "object",
          name: "blogSection",
          fields: [
            defineField({
              name: "subheading",
              title: "Subheading",
              description: "Set bold, at the same size as the body.",
              type: "string",
            }),
            defineField({
              name: "body",
              title: "Paragraphs",
              description: "One entry per paragraph.",
              type: "array",
              of: [{ type: "text", rows: 5 }],
            }),
            defineField({
              name: "bodyBold",
              title: "Closing emphasis",
              description: "Optional. Appended to the last paragraph in bold.",
              type: "text",
              rows: 2,
            }),
          ],
          preview: { select: { title: "subheading" } },
        },
      ],
    }),
    defineField({
      name: "statsHeading",
      title: "Stats — heading",
      description: "Optional. The stats show with or without it.",
      type: "string",
      group: "article",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      description: "No stats, no stats band.",
      type: "array",
      group: "article",
      of: [
        {
          type: "object",
          name: "blogStat",
          fields: [
            defineField({ name: "num", title: "Figure", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "num", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "statsFootnote",
      title: "Stats — footnote",
      type: "text",
      rows: 2,
      group: "article",
    }),
    defineField({
      name: "closingImage",
      title: "Closing image",
      description: "The full-width picture near the end of the article.",
      type: "image",
      options: { hotspot: true },
      group: "article",
    }),
    defineField({
      name: "closingSections",
      title: "Sections after the closing image",
      description: "Optional. Same shape as the body sections above.",
      type: "array",
      group: "article",
      of: [
        {
          type: "object",
          name: "blogSection",
          fields: [
            defineField({ name: "subheading", title: "Subheading", type: "string" }),
            defineField({
              name: "body",
              title: "Paragraphs",
              type: "array",
              of: [{ type: "text", rows: 5 }],
            }),
            defineField({ name: "bodyBold", title: "Closing emphasis", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "subheading" } },
        },
      ],
    }),
  ],

  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
