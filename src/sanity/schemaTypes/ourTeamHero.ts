import { defineField, defineType } from "sanity";

export const ourTeamHero = defineType({
  name: "ourTeamHero",
  title: "Our Team — Hero",
  type: "document",
  fields: [
    defineField({
      name: "titleLine1",
      title: "Title Line 1",
      type: "string",
      description: 'e.g., "Builders"',
    }),
    defineField({
      name: "titleLine2",
      title: "Title Line 2 (Highlighted)",
      type: "string",
      description: 'e.g., "Backing"',
    }),
    defineField({
      name: "titleLine3",
      title: "Title Line 3",
      type: "string",
      description: 'e.g., "Builders"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "members",
      title: "Team Member Images",
      type: "array",
      of: [{ type: "image" }],
      description:
        "Upload exactly 12 images to fill the grid perfectly (5 in row 1, 4 in row 2, 3 in row 3).",
      validation: (Rule) => Rule.max(12),
    }),
  ],
});