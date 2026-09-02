import { defineField, defineType } from "sanity";

/**
 * Our Story page — Fifteen Years of Showing Up section.
 *
 * One year per array entry (2011 → 2026). Each year carries its own
 * subtitle and description that swap in/out on the right side as the
 * user clicks the year chips (or as autoplay advances every 5 s).
 *
 * Editors control:
 *   - The split heading ("Fifteen Years of" + italic "Showing Up")
 *   - The list of years and their per-year copy
 */
export const fifteenYears = defineType({
  name: "fifteenYears",
  title: "Our Story — Fifteen Years of Showing Up",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading (first)",
      description: 'e.g. "Fifteen Years of"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "headingHighlight",
      title: "Heading (italic, light-blue pill)",
      description: 'e.g. "Showing Up"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "years",
      title: "Year entries",
      description:
        "Each year (2011–2026) gets its own subtitle and description. Sort by year asc — the runtime keeps the list in order regardless.",
      type: "array",
      of: [
        {
          type: "object",
          name: "yearEntry",
          fields: [
            defineField({
              name: "year",
              title: "Year",
              type: "number",
              validation: (r) => r.required().integer().min(2011).max(2026),
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle (large bold line)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description (paragraph below)",
              type: "richText",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            /* `year` is a NUMBER, and a preview title has to be a string.
               Handing the number straight through crashes the Studio the
               moment you open one of these entries: its breadcrumb calls
               `title.toLowerCase()`, which a number does not have, and the
               whole editor drops to an error screen.

               So it is selected under a different key and turned into a
               string here. `?? ""` covers a freshly added entry, which has
               no year yet. */
            select: { year: "year", subtitle: "subtitle" },
            prepare: ({ year, subtitle }) => ({
              title: year === undefined || year === null ? "New year" : String(year),
              subtitle: (subtitle as string) ?? "",
            }),
          },
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],

  preview: {
    prepare: () => ({ title: "Our Story — Fifteen Years of Showing Up" }),
  },
});
