import { defineField, defineType } from "sanity";

/**
 * Our Story page — Hero section. Singleton.
 *
 * Editor controls:
 *   - Top line of the heading (plain weight, e.g. "Built by people who've been")
 *   - Highlighted italic line shown inside the cream pill (e.g. "where you are today.")
 *   - The pull-quote shown over the founders image
 *   - The founders photo itself
 */
export const ourStoryHero = defineType({
  name: "ourStoryHero",
  title: "Our Story — Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — first line",
      description: 'Plain weight. e.g. "Built by people who\'ve been"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingHighlight",
      title: "Heading — italic highlighted line",
      description:
        'Shown italic inside a cream pill. e.g. "where you are today."',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Founders image",
      description:
        "Photo shown below the heading with the quote overlaid. Use a high-resolution landscape image (recommended ≥1400×1200).",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quote",
      title: "Pull quote",
      description: "Shown overlaid on the bottom of the founders image.",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
  ],

  preview: { prepare: () => ({ title: "Our Story — Hero" }) },
});
