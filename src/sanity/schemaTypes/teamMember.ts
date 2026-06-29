import { defineField, defineType } from "sanity";

/**
 * Reusable object type — one entry in any of the three Our Team
 * arrays (corporate / seed / winnerFund). Defining it once means
 * the Studio UI stays consistent across all three and we can add
 * fields (e.g. bio, location) in one place later.
 */
export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "object",

  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /ourteam/<slug>)",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required().error("Slug is required for the detail page URL"),
    }),
    defineField({
      name: "title",
      title: "Job title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      description:
        "Square photo, ideally on a plain or simple background. Renders as monochrome by default; colour appears on hover.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Bio (shown on the detail page)",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "emailUrl",
      title: "Email (mailto: link or email address)",
      description: 'Either a "mailto:foo@bar.com" URL or just "foo@bar.com".',
      type: "string",
    }),
    defineField({
      name: "twitterUrl",
      title: "X / Twitter URL",
      type: "url",
    }),
  ],

  preview: {
    select: { title: "name", subtitle: "title", media: "image" },
  },
});
