import { defineField, defineType } from "sanity";
import { SECTORS, STAGES, STATUSES, asSanityList } from "@/lib/portfolioFilters.mjs";

/**
 * Portfolio — Grid & Detail section.
 *
 * Singleton. Stores ALL portfolio company data used by both the
 * filterable grid (/portfolio) and detail pages (/portfolio/[slug]).
 */
export const portfolioGrid = defineType({
  name: "portfolioGrid",
  title: "Portfolio — All Companies",
  type: "document",

  fields: [
    defineField({
      name: "companies",
      title: "Portfolio companies",
      type: "array",
      of: [
        {
          type: "object",
          name: "portfolioGridCompany",
          fields: [
            /* ── Grid fields ── */
            defineField({ name: "brandName", title: "Brand Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "year", title: "Year (e.g. 2021-22)", type: "string" }),
            /* ARRAYS, not single strings — a company can genuinely be more
               than one thing at once (Exited AND IPO, say). With `options.list`
               on an array field Sanity renders a checkbox list, so the editor
               ticks every value that applies instead of being forced to pick
               the single "most true" one. */
            defineField({
              name: "sector",
              title: "Sector",
              description: "Tick every sector that applies.",
              type: "array",
              of: [{ type: "string" }],
              options: { list: asSanityList(SECTORS) },
            }),
            defineField({
              name: "status",
              title: "Status",
              description:
                "Drives the Status filter on /portfolio. Tick every status that applies — a company can be both Exited and IPO.",
              type: "array",
              of: [{ type: "string" }],
              options: { list: asSanityList(STATUSES) },
            }),
            defineField({
              name: "tags",
              title: "Tags (e.g. Recent Investment, Unicorn)",
              description: "The badge on the card shows the first one.",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "investmentStage",
              title: "Investment Stage",
              description: "Tick every stage that applies.",
              type: "array",
              of: [{ type: "string" }],
              options: { list: asSanityList(STAGES) },
            }),
            defineField({ name: "fundType", title: "Fund Type", type: "string" }),
            defineField({ name: "logo", title: "Logo", type: "image", options: { hotspot: true } }),
            defineField({ name: "founderImage", title: "Founders Image (card flip)", type: "image", options: { hotspot: true } }),

            /* ── Detail page fields ── */
            defineField({ name: "foundingYear", title: "Founding Year", type: "string" }),
            defineField({ name: "oneLiner", title: "One Liner", type: "string" }),
            defineField({ name: "about", title: "About the company", type: "text", rows: 6 }),
            defineField({ name: "website", title: "Website", type: "string" }),
            defineField({ name: "newsBlogs", title: "News/Blogs URL", type: "string" }),
            defineField({ name: "youtube", title: "YouTube URL", type: "string" }),
            defineField({
              name: "milestones",
              title: "Milestones (comma-separated)",
              description:
                "Auto-filled from Founding Year, Year and Tags (e.g. \"Founded 2011, Partnered 2021, IPO\"). Edit only to override — clearing it makes the site fall back to those same derived values.",
              type: "string",
            }),
            defineField({ name: "companyLinkedin", title: "Company LinkedIn", type: "string" }),
            defineField({
              name: "gallery",
              title: "Gallery images (marquee scroll on detail page)",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
              options: { layout: "grid" },
            }),

            /* ── Founders (up to 5) ── */
            defineField({
              name: "founders",
              title: "Founders",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "gridFounder",
                  fields: [
                    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
                    defineField({ name: "linkedin", title: "LinkedIn URL", type: "string" }),
                  ],
                  preview: { select: { title: "name" } },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "brandName", sector: "sector", media: "logo" },
            /* `sector` IS AN ARRAY NOW, and a Studio preview subtitle has to be
               a plain string — handed a list it throws "should be a string …
               instead saw array". Selecting it under its own key and joining it
               here keeps the list in the data and gives the preview the string
               it needs. Still accepts a bare string for rows saved before the
               field became multi-value. */
            prepare: ({ title, sector, media }) => ({
              title: (title as string) || "Untitled company",
              subtitle: Array.isArray(sector)
                ? sector.filter(Boolean).join(", ")
                : ((sector as string) ?? ""),
              media,
            }),
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Portfolio — All Companies" }) },
});
