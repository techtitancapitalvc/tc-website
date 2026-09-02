import { defineField, defineType } from "sanity";

/**
 * /titanecosystem — the scroll rail beneath the hero. Singleton.
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
              type: "richText",
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
              description:
                'Where the button goes, e.g. "/getinvestment". Ignored if a QR code is set below — the button opens the QR instead of navigating.',
              type: "string",
              hidden: ({ parent }) => !parent?.ctaLabel,
            }),

            /* ─── The QR pop-up ───
               THE QR IMAGE IS THE SWITCH. Upload one and this part's button
               stops being a link and opens a centred pop-up instead; leave it
               empty and the button navigates to the URL above exactly as it
               always has. Nothing else needs setting, and no other part is
               affected — which is why there is no "show the QR" checkbox to
               get out of step with whether a QR actually exists. */
            defineField({
              name: "ctaQr",
              title: "QR code",
              description:
                "Optional. Upload a QR and this part's button opens it in a pop-up in the middle of the screen instead of following the link.",
              type: "image",
              hidden: ({ parent }) => !parent?.ctaLabel,
            }),
            defineField({
              name: "ctaQrHeading",
              title: "QR — heading",
              description: 'Above the code, e.g. "Scan QR To Join Group".',
              type: "string",
              hidden: ({ parent }) => !parent?.ctaQr,
            }),
            defineField({
              name: "ctaQrCaption",
              title: "QR — caption",
              description: "Optional small line under the code.",
              type: "text",
              rows: 2,
              hidden: ({ parent }) => !parent?.ctaQr,
            }),
          ],
          preview: { select: { title: "title", subtitle: "visual" } },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Titan Ecosystem — Pillars rail" }) },
});
