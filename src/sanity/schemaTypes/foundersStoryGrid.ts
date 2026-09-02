import { defineField, defineType } from "sanity";

/**
 * /foundersstory — the Featured Story band and the grid beneath it. Singleton.
 *
 * THIS IS ITS OWN DOCUMENT ON PURPOSE. The page used to read the home page's
 * "impactAtGlance" singleton, so the two shared one list of founder stories,
 * one heading and one CTA label — editing the founders-story grid silently
 * changed the home page, and the other way round. They are different pages
 * with different copy, so they now have different documents. Nothing here
 * affects the home page.
 *
 * WHICH CARD LEADS: tick "Featured story" on one entry and it fills the band
 * at the top of the page. Every entry, featured or not, also appears in the
 * grid below.
 *
 * WHERE A CARD LINKS: "Story slug" points at the internal page. It is optional
 * — left empty the link is guessed from the company name in the role, which is
 * what the page did before this field existed — so filling it in is how you fix
 * a card whose guess does not match its story.
 */
export const foundersStoryGrid = defineType({
  name: "foundersStoryGrid",
  title: "Founders Story — Featured & Grid",
  type: "document",

  groups: [
    { name: "featured", title: "Featured band" },
    { name: "grid", title: "Grid" },
  ],

  fields: [
    /* ─────────── The Featured Story band ─────────── */
    defineField({
      name: "heading",
      title: "Featured band — heading",
      description: 'e.g. "Featured Stories"',
      type: "string",
      group: "featured",
    }),
    defineField({
      name: "browseLabel",
      title: "Featured band — browse link label",
      description: 'e.g. "Browse all stories"',
      type: "string",
      group: "featured",
    }),
    defineField({
      name: "browseHref",
      title: "Featured band — browse link URL",
      description: 'Where that link goes, e.g. "/foundersstory".',
      type: "string",
      group: "featured",
    }),

    /* ─────────── The grid ─────────── */
    defineField({
      name: "gridHeading",
      title: "Grid — heading",
      /* ONE FIELD. Two fields forced two lines whatever was typed; now what
         you write is what renders. */
      description:
        'e.g. "Founder Stories". Press Enter for another line — line breaks are kept exactly as you type them.',
      type: "text",
      rows: 2,
      group: "grid",
    }),
    defineField({
      name: "ctaLabel",
      title: "Grid — button label",
      description: 'e.g. "See More"',
      type: "string",
      group: "grid",
    }),

    defineField({
      name: "stories",
      title: "Stories",
      description:
        "Every entry appears in the grid. Tick one as the featured story and it also fills the band at the top of the page.",
      type: "array",
      group: "grid",
      of: [
        {
          type: "object",
          name: "founderStoryCard",
          fields: [
            defineField({
              name: "featured",
              title: "Featured story",
              description:
                "Shows this one in the band at the top of the page. If several are ticked the first wins; if none is, the first story in the list is used.",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "name",
              title: "Founder name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "role",
              title: "Role",
              description: 'e.g. "Co-Founder, Mamaearth" — the company after the comma is what the link falls back to.',
              type: "string",
            }),
            defineField({
              name: "storySlug",
              title: "Story slug (the internal page)",
              description:
                'Which story page this card opens, e.g. "mamaearth" for /foundersstory/mamaearth. Leave empty to guess it from the company name in the role.',
              type: "string",
            }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "logo",
              title: "Company logo",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "logoScale",
              title: "Logo scale",
              description: "1 is unscaled. The marks sit on a square canvas, so this sizes the wordmark inside it.",
              type: "number",
            }),
            defineField({
              name: "logoOffsetY",
              title: "Logo nudge (vertical %)",
              description: "Positive moves it down. Cancels out the differing transparent padding around each mark.",
              type: "number",
            }),
            defineField({
              name: "text",
              title: "Quote",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "tags",
              title: "Tags",
              description: "Up to three; they cycle in the card's corner pill.",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "image" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Founders Story — Featured & Grid" }) },
});
