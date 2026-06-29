import { defineField, defineType } from "sanity";

/**
 * Our Team page singleton. Heading is split into two parts —
 * the italic/highlighted phrase (e.g. "Meet The") and the
 * regular trailing phrase (e.g. "Full Team."). Three separate
 * arrays for Corporate / Seed / Winner Fund teams so editors
 * can manage each group independently in Studio.
 */
export const ourTeam = defineType({
  name: "ourTeam",
  title: "Our Team Page",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — italic / highlighted phrase",
      description: 'Shown first, in italic with a light-blue pill. e.g. "Meet The"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — regular phrase",
      description: 'Shown after, no highlight. e.g. "Full Team."',
      type: "string",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "corporateTeam",
      title: "Corporate Team",
      type: "array",
      of: [{ type: "teamMember" }],
    }),
    defineField({
      name: "seedTeam",
      title: "Seed Team",
      type: "array",
      of: [{ type: "teamMember" }],
    }),
    defineField({
      name: "winnerFundTeam",
      title: "Winner Fund Team",
      type: "array",
      of: [{ type: "teamMember" }],
    }),
  ],

  preview: { prepare: () => ({ title: "Our Team Page" }) },
});
