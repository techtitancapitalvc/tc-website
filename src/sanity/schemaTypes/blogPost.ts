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
 *   /blogs/[slug]   the article — that same header, then the acts
 *
 * so a card can never drift from the post it links to.
 *
 * EVERY PART OF THE ARTICLE IS OPTIONAL and hides itself when empty: an act
 * with no quote has no cream block, one with no figures has no strip, and a
 * post with no explore heading has no band at the end. That is why almost
 * nothing here is `required` — marking fields required would force editors to
 * fill in parts of a layout they do not want on that post.
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

    /* ─────────── Article ─────────── */
    defineField({
      name: "acts",
      title: "Acts",
      description:
        'The body, in parts — "Act I", "Act II" and so on. Each carries its own optional pull quote, figures strip and picture, so they land where the piece wants them rather than only at the end.',
      type: "array",
      group: "article",
      of: [
        {
          type: "object",
          name: "blogAct",
          fields: [
            defineField({
              name: "eyebrow",
              title: "Eyebrow",
              description: 'The small line above the title, e.g. "Act I Before Titan".',
              type: "string",
            }),
            defineField({
              name: "title",
              title: "Title",
              description: 'e.g. "Before."',
              type: "string",
            }),
            defineField({
              name: "body",
              title: "Paragraphs",
              description:
                "One entry per paragraph. The first letter of the first paragraph is set as a drop cap.",
              type: "array",
              of: [{ type: "text", rows: 5 }],
            }),
            defineField({
              name: "bodyBold",
              title: "Closing emphasis",
              description:
                "Optional. Appended to the last paragraph in bold — the line the act lands on.",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "quote",
              title: "Pull quote",
              description: "Optional cream block at the end of the act.",
              type: "object",
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({ name: "text", title: "Quote", type: "text", rows: 3 }),
                defineField({ name: "attribution", title: "Attribution", type: "string" }),
              ],
            }),
            defineField({
              name: "stats",
              title: "Figures",
              description:
                "Optional cream strip of numbers after the quote. No figures, no strip.",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "blogStat",
                  fields: [
                    defineField({
                      name: "num",
                      title: "Figure",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({ name: "label", title: "Label", type: "string" }),
                  ],
                  preview: { select: { title: "num", subtitle: "label" } },
                },
              ],
            }),
            defineField({
              name: "image",
              title: "Picture",
              description: "Optional full-width picture, after the quote and figures.",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
        },
      ],
    }),

    /* ─────────── Explore band ─────────── */
    defineField({
      name: "exploreHeading",
      title: "Explore — heading",
      description: 'e.g. "Explore Blog". Leave empty to hide the whole band.',
      type: "string",
      group: "article",
    }),
    defineField({
      name: "exploreBrowseLabel",
      title: "Explore — browse link label",
      type: "string",
      group: "article",
    }),
    defineField({
      name: "exploreBrowseHref",
      title: "Explore — browse link URL",
      type: "string",
      group: "article",
    }),
  ],

  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
