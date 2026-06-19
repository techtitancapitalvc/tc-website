import { defineField, defineType } from "sanity";

/**
 * Get Investment page — FAQ section.
 *
 * Singleton. Accordion-style FAQ items with question + answer.
 */
export const getInvestmentFAQ = defineType({
  name: "getInvestmentFAQ",
  title: "Get Investment — FAQ Section",
  type: "document",

  fields: [
    defineField({
      name: "headingFirst",
      title: "Heading — line 1 (plain)",
      description: 'e.g. "You\'ve Got Questions"',
      type: "string",
    }),
    defineField({
      name: "headingSecond",
      title: "Heading — line 2 (italic + highlighted)",
      description: 'e.g. "We\'ve Got Answers"',
      type: "string",
    }),
    defineField({
      name: "items",
      title: "FAQ Items",
      description: "Each item is a question + answer pair.",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            defineField({
              name: "id",
              title: "Unique ID",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Get Investment — FAQ Section" }) },
});
