import { defineField, defineType } from "sanity";

/**
 * Winners Fund page — "About The Fund" section.
 *
 * Singleton. Mirrors AboutTheFundClient.tsx:
 *   - Two-part heading ("About The" + italic-highlighted "Fund")
 *   - 3 description paragraphs (left column)
 *   - Right column: floating cluster of labelled pills + dark balls.
 *     Positions/rotations/dot placement all stay in code — only the
 *     pill labels are CMS-editable (keyed by id, like WhatFoundersGet).
 */
export const aboutTheFund = defineType({
  name: "aboutTheFund",
  title: "Winners — About The Fund Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "About The"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Fund"',
      type: "string",
    }),
    defineField({
      name: "paragraphs",
      title: "Description paragraphs",
      description: "Each item is one paragraph in the left column.",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      validation: (r) => r.max(6).warning("Design fits 3 best — more may overflow the column."),
    }),
    defineField({
      name: "pills",
      title: "Floating pill labels",
      description:
        "Floating pills and dots. Each item includes position (x, y), rotation, and type (pill or dot).",
      type: "array",
      of: [
        {
          type: "object",
          name: "aboutTheFundPill",
          fields: [
            defineField({
              name: "id",
              title: "Slot ID",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              title: "Label text",
              type: "string",
            }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: { list: ["pill", "dot"] },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "rotate",
              title: "Rotation (degrees)",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "x",
              title: "X position (em)",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "y",
              title: "Y position (em)",
              type: "number",
              initialValue: 0,
            }),
          ],
          preview: { select: { title: "label", subtitle: "id" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Winners — About The Fund Section" }) },
});
