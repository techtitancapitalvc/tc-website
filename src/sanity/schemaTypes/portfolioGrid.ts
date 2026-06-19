import { defineField, defineType, defineArrayMember } from "sanity";

export const companyType = defineType({
  name: "company",
  title: "Portfolio Company",
  type: "document",
  fields: [
    /* ── Grid Fields ── */
    defineField({ name: "brandName", title: "Brand Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "brandName", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "status", title: "Status", type: "string" }),
    defineField({ name: "tags", title: "Tags", type: "string" }),
    defineField({ name: "investmentStage", title: "Investment Stage", type: "string" }),
    defineField({ name: "fundType", title: "Fund Type", type: "string" }),
    defineField({ name: "logo", title: "Grid Logo", type: "image" }),
    defineField({ name: "founderImage", title: "Grid Founder Image", type: "image" }),

    /* ── Detail Page Fields ── */
    defineField({ name: "foundingYear", title: "Founding Year", type: "string" }),
    defineField({ name: "oneLiner", title: "One Liner", type: "string" }),
    defineField({ name: "about", title: "About the Company", type: "text" }),
    defineField({ name: "website", title: "Website", type: "string" }),
    
    /* ── Founders Array ── */
    defineField({
      name: "founders",
      title: "Founders",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "linkedin", title: "LinkedIn URL", type: "string" })
          ],
          preview: {
            select: { title: "name", subtitle: "linkedin" }
          }
        })
      ]
    })
  ],
  preview: {
    select: { title: "brandName", subtitle: "sector", media: "logo" },
  },
});