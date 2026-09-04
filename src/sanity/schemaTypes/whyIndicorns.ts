import { defineField, defineType } from "sanity";

/**
 * /indicorns — "Why We Created The Indicorns?" section. Singleton.
 *
 * Two blocks: the September 2024 story (photo + copy) and the timeline
 * carousel beneath it. The timeline shows three cards at a time on desktop
 * and slides as it advances, so adding entries needs no code change.
 */
export const whyIndicorns = defineType({
  name: "whyIndicorns",
  title: "Indicorns — Why We Created",
  type: "document",

  fields: [
    /* ─────────── Heading ─────────── */
    defineField({
      name: "heading",
      title: "Heading",
      /* ONE FIELD, and the line breaks are yours. It used to be two fields
         with a hard <br> welded between them, so the heading was always two
         lines whatever was typed. Now what you write is what renders: one line
         stays one line, and pressing Enter gives you a second. */
      description:
        'e.g. "Why We Created The Indicorns?". Press Enter for another line — line breaks are kept exactly as you type them.',
      type: "text",
      rows: 2,
    }),

    /* ─────────── Story block ─────────── */
    defineField({
      name: "storyLabel",
      title: "Story — date label",
      description: 'e.g. "September 2024"',
      type: "string",
    }),
    defineField({
      name: "storyImage",
      title: "Story — photo",
      type: "image",
      options: { hotspot: true },
    }),
    /* RICH TEXT, and that also collapses a list into a field. These were an
       ARRAY of plain paragraphs — one entry per paragraph, added with the
       "Add item" button. Rich text carries paragraphs natively, so the array
       is gone: press Enter for a new one, and select any words to make them
       bold, italic or underlined. */
    defineField({
      name: "storyParagraphs",
      title: "Story — copy (DESKTOP)",
      description:
        "Shown from the md breakpoint upwards. Press Enter for a new paragraph; select text to style it.",
      type: "richText",
    }),
    defineField({
      name: "storyParagraphsMobile",
      title: "Story — copy (MOBILE)",
      description:
        "Deliberately separate from the desktop copy, which is currently worded differently. Leave empty to reuse the desktop copy.",
      type: "richText",
    }),

    /* ─────────── Timeline ─────────── */
    defineField({
      name: "timeline",
      title: "Timeline entries",
      description:
        "Three show at once on desktop; the rail slides as it auto-advances, and wraps back to the first. Add as many as you like.",
      type: "array",
      of: [
        {
          type: "object",
          name: "indicornTimelineEntry",
          fields: [
            defineField({
              name: "date",
              title: "Date label",
              description: 'e.g. "October 2024" or "2026"',
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              description:
                "Press Enter for a second line — line breaks are preserved.",
              type: "text",
              rows: 2,
              validation: (r) => r.required(),
            }),
            defineField({
              name: "desc",
              title: "Description",
              type: "richText",
            }),
            defineField({
              name: "statNumber",
              title: "Stat — big number",
              description:
                'e.g. "186". Leave the three stat fields empty for an entry with no stat block.',
              type: "string",
            }),
            defineField({
              name: "statLabel",
              title: "Stat — label beside the number",
              description:
                'e.g. "Companies\nRecognized". Line breaks are preserved.',
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "statSub",
              title: "Stat — caption underneath",
              description: "Line breaks are preserved.",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "date", subtitle: "title" },
          },
        },
      ],
    }),
  ],

  preview: { prepare: () => ({ title: "Indicorns — Why We Created" }) },
});
