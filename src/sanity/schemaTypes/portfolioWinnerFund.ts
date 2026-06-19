import { defineField, defineType } from "sanity";

/**
 * Winners Fund page — Portfolio companies grid.
 *
 * Singleton. Mirrors PortfolioWinnerFundClient.tsx:
 *   - Two-part heading (optional)
 *   - Grid of company cards (logo + name + category)
 *   - Each card has per-logo `logoW` / `logoH` so different aspect-ratio
 *     logos can be normalised to the same visual weight.
 */
export const portfolioWinnerFund = defineType({
  name: "portfolioWinnerFund",
  title: "Winners — Portfolio Companies Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain) (optional)",
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted) (optional)",
      type: "string",
    }),
    defineField({
      name: "companies",
      title: "Portfolio companies",
      type: "array",
      of: [
        {
          type: "object",
          name: "portfolioWinnerCompany",
          fields: [
            defineField({
              name: "name",
              title: "Company name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logo",
              title: "Logo image",
              type: "image",
              options: { hotspot: true },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "category",
              title: "Category / Tagline",
              description: 'e.g. "Pure & natural foods"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logoW",
              title: "Logo width (% of card)",
              description: 'e.g. "65%" — controls how wide the logo renders inside the card box.',
              type: "string",
              initialValue: "60%",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "logoH",
              title: "Logo height (% of card)",
              description: 'e.g. "20%" — controls how tall the logo renders inside the card box.',
              type: "string",
              initialValue: "25%",
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "name", subtitle: "category", media: "logo" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Winners — Portfolio Companies Section" }) },
});
