import { defineField, defineType } from "sanity";

/**
 * Winners Fund page — Hero section.
 *
 * Singleton. Mirrors WinnersHeroClient.tsx:
 *   - "Doubling Down On" (plain) + "Breakout Companies" (italic + highlighted)
 *   - Subtitle paragraph
 *   - Animated grid background stays in code
 */
export const winnersHero = defineType({
  name: "winnersHero",
  title: "Winners — Hero Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "Doubling Down On"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Breakout Companies"',
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle paragraph",
      type: "text",
      rows: 3,
    }),
  ],

  preview: { prepare: () => ({ title: "Winners — Hero Section" }) },
});
