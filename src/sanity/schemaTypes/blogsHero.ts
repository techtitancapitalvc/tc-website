import { defineField, defineType } from "sanity";

/**
 * Blogs — Hero. Its own document, separate from the listing below it, so the
 * headline can be edited without opening the page that holds every post.
 */
export const blogsHero = defineType({
  name: "blogsHero",
  title: "Blogs — Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — first line",
      description: 'e.g. "Thinking From The"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — second line",
      description: 'e.g. "Titan Ecosystem"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 4,
    }),
  ],

  preview: { prepare: () => ({ title: "Blogs — Hero" }) },
});
