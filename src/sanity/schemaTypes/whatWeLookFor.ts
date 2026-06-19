import { defineField, defineType } from "sanity";

/**
 * Titan Seed Fund page — "What We Look For" section.
 *
 * Singleton. Mirrors WhatWeLookForClient.tsx:
 *   - Two-part heading ("What We" + italic-highlighted "Look For")
 *   - 4 items (title + description) in a 2-column desktop layout
 *
 * The hand-drawn checkbox+tick SVG icon stays in code — only the
 * editorial copy (title + desc per item) is editable in the CMS.
 */
export const whatWeLookFor = defineType({
  name: "whatWeLookFor",
  title: "Titan Seed — What We Look For Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "What We"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Look For"',
      type: "string",
    }),
    defineField({
      name: "items",
      title: "Items",
      description: "4 entries is the design ideal (2 per column on desktop).",
      type: "array",
      of: [
        {
          type: "object",
          name: "lookForItem",
          fields: [
            defineField({
              name: "title",
              title: "Item title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Item description",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "desc" } },
        },
      ],
      validation: (r) =>
        r.min(2).max(6).warning("Design fits 4 best — 2–6 will work, more may wrap awkwardly."),
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Seed — What We Look For Section" }) },
});
