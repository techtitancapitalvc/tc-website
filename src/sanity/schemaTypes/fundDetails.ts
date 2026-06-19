import { defineField, defineType } from "sanity";

/**
 * Winners Fund page — "Fund Details" accordion section.
 *
 * Singleton. Mirrors FundDetailsClient.tsx:
 *   - Two-part heading ("Fund" + italic-highlighted "Details")
 *   - 2 fund accordion cards (Fund I, Fund II), each with structured data
 *   - Bottom labels show "Trustee" + "Sponsors" rows under each fund
 */
export const fundDetails = defineType({
  name: "fundDetails",
  title: "Winners — Fund Details Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "Fund"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "Details"',
      type: "string",
    }),
    defineField({
      name: "funds",
      title: "Funds",
      description: "One accordion card per fund. Design fits 2 (Fund I + Fund II).",
      type: "array",
      of: [
        {
          type: "object",
          name: "fundInfo",
          fields: [
            defineField({
              name: "title",
              title: "Accordion title",
              description: 'e.g. "Fund I Details"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "aifName",
              title: "AIF Name",
              type: "string",
            }),
            defineField({
              name: "sebiNumber",
              title: "SEBI Registration Number",
              type: "string",
            }),
            defineField({
              name: "category",
              title: "Category",
              description: 'e.g. "Category II AIF"',
              type: "string",
            }),
            defineField({
              name: "fundManager",
              title: "Fund Manager",
              type: "string",
            }),
            defineField({
              name: "officeAddress",
              title: "Office Address",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "bottomLabels",
              title: "Trustee / Sponsor rows (bottom of card)",
              description: "Each entry is a heading + value pair shown under the dashed line.",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "fundBottomLabel",
                  fields: [
                    defineField({
                      name: "heading",
                      title: "Heading",
                      description: 'e.g. "Trustee:" or "Sponsors:"',
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "value",
                      title: "Value",
                      description: 'e.g. "Catalyst Trusteeship Limited"',
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                  ],
                  preview: { select: { title: "value", subtitle: "heading" } },
                },
              ],
            }),
          ],
          preview: { select: { title: "title", subtitle: "aifName" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Winners — Fund Details Section" }) },
});
