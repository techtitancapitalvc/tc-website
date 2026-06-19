import { defineField, defineType } from "sanity";

/**
 * Titan Seed Fund page — "Why Titan Seed" section.
 *
 * Singleton. Mirrors WhyTitanSeedClient.tsx:
 *   - Two-part heading ("Why" + italic-highlighted "Titan Seed")
 *   - 4 cards (title + description) with the cluster→spread animation
 *
 * The pin SVGs, card backgrounds, cluster/spread positions and animation
 * stay in code — only the card text comes from the CMS.
 */
export const whyTitanSeed = defineType({
  name: "whyTitanSeed",
  title: "Titan Seed — Why Titan Seed Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "Why"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Titan Seed"',
      type: "string",
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description:
        "Exactly 4 cards — the cluster→spread layout has 4 hand-placed positions. Other counts won't render correctly.",
      type: "array",
      of: [
        {
          type: "object",
          name: "whyTitanSeedCard",
          fields: [
            defineField({
              name: "title",
              title: "Card title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Card description",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "desc" } },
        },
      ],
      validation: (r) =>
        r.length(4).warning("Design fits exactly 4 cards — change with care."),
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Seed — Why Titan Seed Section" }) },
});
