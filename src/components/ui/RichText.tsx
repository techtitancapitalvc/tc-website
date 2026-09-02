"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import {
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  CAPTION_STYLE,
} from "@/styles/heroTypography";

/**
 * Renders a `richText` field — see src/sanity/schemaTypes/richText.ts.
 *
 * IT TAKES A STRING TOO, and that is the point rather than a convenience. The
 * description fields are being converted from plain `text` to rich text a few
 * at a time, and the documents in the dataset still hold plain strings until
 * each is migrated. A renderer that accepted only Portable Text would blank
 * every un-migrated description the moment its schema changed. This one shows
 * whatever it is given, so schema, code and data can move independently and
 * nothing is ever empty in between.
 *
 * The three styles map to the site's description levels — see the note on the
 * schema type. Everything else about the type is left alone: the caller passes
 * the className and colour, exactly as it did when this was a plain string, so
 * converting a field does not restyle it.
 */
export type RichTextValue = string | PortableTextBlock[] | null | undefined;

/** True when the value carries any actual text, so callers can still do
 *  `{description && <RichText …/>}` without knowing which shape it is. */
export function hasRichText(value: RichTextValue): boolean {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return value.some((b) => {
    const children = (b as { children?: { text?: string }[] }).children;
    return children?.some((c) => (c.text ?? "").trim().length > 0);
  });
}

function components(
  className?: string,
  style?: React.CSSProperties
): PortableTextComponents {
  /* The paragraph keeps the caller's own class and style, so a converted field
     renders exactly as the string it replaced. Only the two smaller styles
     override the size, because choosing them is the editor asking for one. */
  const para = (level?: React.CSSProperties) => ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <p className={`m-0 ${className ?? ""}`} style={{ ...style, ...level }}>
      {children}
    </p>
  );

  return {
    block: {
      normal: para(),
      h4: para(LABEL_STYLE),
      h5: para(CAPTION_STYLE),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      underline: ({ children }) => (
        <span className="underline underline-offset-2">{children}</span>
      ),
    },
  };
}

export default function RichText({
  value,
  className,
  style,
}: {
  value: RichTextValue;
  /** Applied to every paragraph, exactly as it was on the old plain string. */
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!hasRichText(value)) return null;

  if (typeof value === "string") {
    /* `whitespace-pre-line` so a not-yet-converted string keeps the line
       breaks its editor typed, which is how these read today. */
    return (
      <p className={`m-0 whitespace-pre-line ${className ?? ""}`} style={style}>
        {value}
      </p>
    );
  }

  return (
    <PortableText value={value} components={components(className, style)} />
  );
}

/** The default description level, for callers that had no class of their own. */
export const RICH_TEXT_DEFAULTS = {
  className: HERO_BODY_CLASS,
  style: HERO_BODY_STYLE,
};
