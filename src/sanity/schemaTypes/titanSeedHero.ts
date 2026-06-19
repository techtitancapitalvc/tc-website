import { defineField, defineType } from "sanity";

/**
 * Titan Seed Fund page — hero section.
 *
 * Singleton. Mirrors TitanSeedHeroClient.tsx:
 *   - Two-part heading ("We Are Your" + italic-highlighted "First Believer")
 *   - Subtitle paragraph
 *   - Animated grid background stays in code (decorative, not content)
 */
export const titanSeedHero = defineType({
  name: "titanSeedHero",
  title: "Titan Seed — Hero Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "We Are Your"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "First Believer"',
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle paragraph",
      type: "text",
      rows: 3,
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Seed — Hero Section" }) },
});
