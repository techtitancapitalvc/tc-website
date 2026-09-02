import { defineType, defineArrayMember } from "sanity";

/**
 * RICH DESCRIPTION TEXT — one type, used by every description, label, caption
 * and bio on the site.
 *
 * It exists so those fields all get the SAME controls. Before this each was a
 * plain `text`, so nothing could be emphasised anywhere, and the alternative —
 * giving each field its own inline block definition — would have meant 60-odd
 * copies of the same list, drifting apart the first time one was edited.
 *
 * WHAT IT DELIBERATELY DOES NOT HAVE:
 *   - headings. Headings and subheadings are their own fields with their own
 *     type scale; letting a description contain an H2 would put two competing
 *     heading systems on the same page.
 *   - lists, links, colours. This is for emphasis inside a sentence. The
 *     story/article blocks (storyBlocks.ts) already carry the full editor for
 *     places that genuinely need one.
 *
 * THE THREE SIZES are the site's own description levels, named for what they
 * are rather than by tag, so an editor is choosing a size and not an HTML
 * element. They map to HERO_BODY / LABEL / CAPTION in heroTypography.ts:
 *
 *   Body        LEVEL 5   the default description size
 *   Small       LEVEL 6   labels, captions, meta lines
 *   Smallest    LEVEL 7   footnotes, legal, credits
 */
export const richText = defineType({
  name: "richText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Body", value: "normal" },
        { title: "Small", value: "h4" },
        { title: "Smallest", value: "h5" },
      ],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [],
      },
    }),
  ],
});

/**
 * Plain text out of a `richText` value, for STUDIO PREVIEWS.
 *
 * A preview's `title`/`subtitle` must be a string. Selecting a rich-text field
 * straight into one throws "should be a string, number, boolean, undefined or
 * null, instead saw array" and the Studio pane fails to render — so any preview
 * that shows one of these fields has to flatten it here first.
 *
 * Accepts a bare string too, for documents saved before the field was
 * converted.
 */
export function richTextToPlain(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] })?.children;
      return Array.isArray(children) ? children.map((c) => c?.text ?? "").join("") : "";
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}
