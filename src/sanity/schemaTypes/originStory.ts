import { defineField, defineType } from "sanity";

/**
 * Our Story page — Origin Story section.
 *
 * Editor controls:
 *   - Heading first + highlighted second word (light-blue pill background)
 *   - Up to N bullets, each with a title, description, and a small image
 *     carousel (cards stack with rotated shadows; front image cycles).
 *
 * Layout alternates per bullet: odd rows show content-left/image-right,
 * even rows show image-left/content-right. The code handles the
 * alternation — editors don't need to think about it.
 *
 * Bold spans in the description can be marked with double asterisks:
 *   "We invested  in **Razorpay** because..."  →  Razorpay renders bold.
 */
export const originStory = defineType({
  name: "originStory",
  title: "Our Story — Origin Story",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading (first word)",
      description: 'e.g. "Origin"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingHighlight",
      title: "Heading (highlighted second word)",
      description: 'Italic, sits on light-blue pill. e.g. "Story"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bullets",
      title: "Bullet points",
      description:
        "Each bullet renders as a row. Layout alternates left/right automatically.",
      type: "array",
      of: [
        {
          type: "object",
          name: "originBullet",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Description",
              description:
                'Wrap any text in double asterisks to bold it. e.g. "We backed **Razorpay** early."',
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "images",
              title: "Images (carousel)",
              description:
                "Add 1+ images. They auto-cycle in a stacked-cards carousel.",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
              validation: (r) => r.min(1),
            }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],

  preview: { prepare: () => ({ title: "Our Story — Origin Story" }) },
});
