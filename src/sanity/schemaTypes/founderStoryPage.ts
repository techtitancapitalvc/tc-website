import { defineField, defineType } from "sanity";

/**
 * /foundersstory/[slug] — one document per company.
 *
 * NOT a singleton: each founder story is its own document, found by slug.
 *
 * THE PAGE IS FOUR INDEPENDENT SECTIONS, and every one of them is optional.
 * A section whose fields are empty does not render at all — so a story with
 * no stats simply has no blue band, and one with no acts jumps from the header
 * to whatever comes next. That is why almost nothing here is `required`:
 * marking fields required would force editors to fill in sections they do not
 * want on that particular page.
 */
export const founderStoryPage = defineType({
  name: "founderStoryPage",
  title: "Founder Story — page",
  type: "document",

  groups: [
    { name: "header", title: "1 · Header" },
    { name: "acts", title: "2 · Acts" },
    { name: "today", title: "3 · Today (blue band)" },
    { name: "explore", title: "4 · Explore" },
  ],

  fields: [
    /* ─────────── 1. HEADER ─────────── */
    defineField({
      name: "slug",
      title: "Slug",
      description:
        'The URL segment, e.g. "mamaearth" for /foundersstory/mamaearth. Generate it from the company name.',
      type: "slug",
      options: { source: "company", maxLength: 96 },
      validation: (r) => r.required(),
      group: "header",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (r) => r.required(),
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
      description: 'e.g. "Ghazal & Varun Alagh". The company is appended after a dash automatically.',
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
    defineField({
      name: "facts",
      title: "Fact bar",
      description:
        "The bordered strip under the photo. Leave every field empty to hide the strip entirely.",
      type: "object",
      group: "header",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({ name: "sector", title: "Sector", type: "string" }),
        defineField({ name: "year", title: "Year", type: "string" }),
        defineField({
          name: "siteUrl",
          title: "Website",
          description: 'Powers the "Visit Site" button. No URL, no button.',
          type: "url",
        }),
      ],
    }),

    /* ─────────── 2. ACTS ─────────── */
    defineField({
      name: "acts",
      title: "Acts",
      description:
        'The narrative sections. Add as many as the story needs — "Act I Before Titan", "Act II", and so on. No acts, no section.',
      type: "array",
      group: "acts",
      of: [
        {
          type: "object",
          name: "storyAct",
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
              validation: (r) => r.required(),
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
              description: "Optional tinted block at the end of the act.",
              type: "object",
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({ name: "text", title: "Quote", type: "text", rows: 3 }),
                defineField({ name: "attribution", title: "Attribution", type: "string" }),
              ],
            }),
          ],
          preview: { select: { title: "title", subtitle: "eyebrow" } },
        },
      ],
    }),

    /* ─────────── 3. TODAY ─────────── */
    defineField({
      name: "todayHeading",
      title: "Heading",
      description: 'e.g. "Mamaearth Consumer, Today". Needs at least one stat to show.',
      type: "string",
      group: "today",
    }),
    defineField({
      name: "todayStats",
      title: "Stats",
      description: "No stats, no blue band.",
      type: "array",
      group: "today",
      of: [
        {
          type: "object",
          name: "todayStat",
          fields: [
            defineField({ name: "num", title: "Figure", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Label", type: "string" }),
          ],
          preview: { select: { title: "num", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "todayFootnote",
      title: "Footnote",
      description: 'e.g. the source of the figures.',
      type: "text",
      rows: 2,
      group: "today",
    }),

    /* ─────────── 4. EXPLORE ─────────── */
    defineField({
      name: "exploreHeading",
      title: "Heading",
      description: 'e.g. "Explore Stories". Leave empty to hide the section.',
      type: "string",
      group: "explore",
    }),
    defineField({
      name: "exploreBrowseLabel",
      title: "Browse link label",
      type: "string",
      group: "explore",
    }),
    defineField({
      name: "exploreBrowseHref",
      title: "Browse link URL",
      type: "string",
      group: "explore",
    }),
  ],

  preview: {
    select: { title: "company", subtitle: "headline" },
  },
});
