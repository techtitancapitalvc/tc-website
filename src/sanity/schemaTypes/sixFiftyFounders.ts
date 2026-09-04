import { defineField, defineType } from "sanity";

/**
 * /foundersstory — the closing band. "650+ Founders. One Extended Team" over
 * three marquee rows of founder portraits. Singleton.
 *
 * IT WAS NEVER WIRED TO SANITY. The component always accepted this data, but
 * the page rendered it with no props, so it fell back to a hard-coded heading
 * and four local files repeated across all 48 tiles. Everything here is what
 * it was already showing, now editable.
 */
export const sixFiftyFounders = defineType({
  name: "sixFiftyFounders",
  title: "Founders Story — 650+ Founders band",
  type: "document",

  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      /* ONE FIELD. It used to be two welded together with a hard line break —
         and they rendered with no space between them, so the page read
         "650+ Founders.One Extended Team". What you type is what shows. */
      description:
        'e.g. "650+ Founders." then Enter, then "One Extended Team". Line breaks are kept exactly as you type them.',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "faces",
      title: "Founder portraits",
      description:
        "The wall of photographs. SQUARE crops read best — each tile is square and the image is centred and cropped to fill it. Add as many as you like: they are dealt across the three rows, and each row starts at a different point so the same face never lines up in a column. With only a handful the wall repeats visibly, so aim for a dozen or more.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
    }),
  ],

  preview: {
    select: { faces: "faces" },
    prepare: ({ faces }) => ({
      title: "Founders Story — 650+ Founders band",
      subtitle: `${Array.isArray(faces) ? faces.length : 0} portrait(s)`,
    }),
  },
});
