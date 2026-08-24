import { defineField, defineType } from "sanity";

/**
 * /titanEcosystem — the scroll rail beneath the hero. Singleton.
 *
 * One long dark section holding several parts, stacked down a vertical line
 * that draws itself as you scroll. Each part is a heading, a rule and a
 * paragraph on one side of the line, with an animated orbit diagram opposite.
 *
 * The rail is driven off the number of parts, so adding a fifth or dropping to
 * three needs no code change.
 */
export const titanEcosystemPillars = defineType({
  name: "titanEcosystemPillars",
  title: "Titan Ecosystem — Pillars rail",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      description: 'Centred at the top of the rail, e.g. "Titan Ecosystem".',
      type: "string",
    }),
    defineField({
      name: "parts",
      title: "Parts",
      description:
        "Each one is a stop on the vertical line. Four is the designed count; the rail adapts if you add or remove one.",
      type: "array",
      of: [
        {
          type: "object",
          name: "titanEcosystemPart",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              description:
                'e.g. "Titan Founders Community". Press Enter for a second line — line breaks are preserved.',
              type: "text",
              rows: 2,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 5,
            }),
            defineField({
              name: "visual",
              title: "Diagram",
              description:
                "The animated graphic opposite the copy. Each is a different idea, so pick the one that matches the part rather than repeating one.",
              type: "string",
              options: {
                list: [
                  { title: "Orbit — satellites breathing around a ring", value: "orbit" },
                  { title: "Mandala — three rings of nodes turning and breathing", value: "mandala" },
                  { title: "Web — a hub whose legs drift", value: "web" },
                  { title: 'Monogram — a dot-matrix "TC" that reacts to the pointer', value: "monogram" },
                ],
                layout: "radio",
              },
              initialValue: "orbit",
            }),
            defineField({
              name: "ctaLabel",
              title: "Button label",
              description:
                'Optional. Leave empty for no button. e.g. "Join Community".',
              type: "string",
            }),
            defineField({
              name: "ctaUrl",
              title: "Button link",
              description: 'Where the button goes, e.g. "/getInvestment".',
              type: "string",
              hidden: ({ parent }) => !parent?.ctaLabel,
            }),
          ],
          preview: { select: { title: "title", subtitle: "visual" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Ecosystem — Pillars rail" }) },
});
