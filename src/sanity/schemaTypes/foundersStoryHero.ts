import { defineField, defineType } from "sanity";

/**
 * Founders Story — Hero. Its own document, separate from the page that holds
 * the stories, so the headline and the row of portraits can be edited without
 * opening the story list.
 */
export const foundersStoryHero = defineType({
  name: "foundersStoryHero",
  title: "Founders Story — Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingLineOne",
      title: "Heading — first line",
      description: 'e.g. "A Central Hub"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingLineTwo",
      title: "Heading — second line",
      description: 'e.g. "For Founders"',
      type: "string",
    }),
    defineField({
      name: "founderImages",
      title: "Founder photos",
      description:
        "The row of portraits along the bottom of the hero. Four is what the layout is built for.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],

  preview: { prepare: () => ({ title: "Founders Story — Hero" }) },
});
