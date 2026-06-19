import { defineField, defineType } from "sanity";

/**
 * Get Investment page — Hero section.
 *
 * Singleton. Simple heading + subtitle text.
 */
export const getInvestmentHero = defineType({
  name: "getInvestmentHero",
  title: "Get Investment — Hero Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — plain part",
      description: 'e.g. "We"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — italic highlighted part",
      description: 'e.g. "Invest Early"',
      type: "string",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle paragraph",
      type: "text",
      rows: 3,
    }),
  ],

  preview: { prepare: () => ({ title: "Get Investment — Hero Section" }) },
});
