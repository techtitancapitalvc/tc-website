import { defineField, defineType } from "sanity";

/**
 * Our Story page — Hero section. Singleton.
 *
 * The hero is a two-line heading over a subtitle, with a field of photographs
 * drifting upward behind it.
 *
 * THE OLD PILL/QUOTE/FOUNDERS-PHOTO FIELDS ARE GONE. They belonged to an
 * earlier design that this hero replaced, and the component had stopped
 * rendering them — leaving them here only forced an editor to fill in a
 * required quote and image that appear nowhere. Nothing had to be migrated:
 * the singleton had never been created in the dataset.
 */
export const ourStoryHero = defineType({
  name: "ourStoryHero",
  title: "Our Story — Hero",
  type: "document",

  fields: [
    defineField({
      name: "headingLineOne",
      title: "Heading — line 1",
      description: 'The first line of the big heading, e.g. "Being Founder".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingLineTwo",
      title: "Heading — line 2",
      description:
        'The second line, e.g. "Takes Guts". Leave empty for a one-line heading.',
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Subtitle",
      description: "The sentence under the heading.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "photos",
      title: "Drifting photos",
      description:
        "The photographs that drift up behind the heading. ANY SHAPE — tall, wide or square; each one is shown at its own aspect ratio and is never cropped, so there is nothing to fit to. Add as many as you like: they are spread across the field so a repeat never lands beside itself. Leave empty to use the built-in set.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    }),
  ],

  preview: {
    select: { title: "headingLineOne", subtitle: "headingLineTwo" },
    prepare: ({ title, subtitle }) => ({
      title: (title as string) || "Our Story — Hero",
      subtitle: (subtitle as string) ?? "",
    }),
  },
});
