"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { RollingNumber } from "./StatsBand";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  CAPTION_STYLE,
} from "@/styles/heroTypography";

/**
 * THE COMPOSED BODY of a founder story AND of a blog article — both pages use
 * this, from the same block types, so they cannot drift apart.
 *
 * Each page used to be fixed sections in a fixed order. It is now whatever the
 * editor composed: this walks `blocks` and renders each by its `_type`, so a
 * fact bar can sit half way down, two quotes can run back to back, and the
 * figures can come before the copy rather than after.
 *
 * ONLY THE HEADER IS FIXED, and each page owns its own — FounderStoryHeader
 * for the story, BlogHeader for the article. Those are the piece's identity
 * rather than its content.
 *
 * The ONE thing that differs between the two is which cards the Explore band
 * shows, and that is passed in.
 *
 * TYPE SCALE, by level:
 *   explore heading, content "Heading — large"   LEVEL 3
 *   quotes, statements, figures, "Heading — medium"   LEVEL 4
 *   body                                          LEVEL 5
 *   eyebrows, labels, attributions, captions       LEVEL 6
 *   figure labels, small print                     LEVEL 7
 */

const NAVY = "#001A4D";
const CREAM = "#FBF7F0";
const COLUMN = "1200px";

/** Same inset the design gives the story against the header above it. */
const INSET = "md:pl-[8.25%] md:pr-[6.5%]";

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* The drop cap. The class is put on ONE paragraph — see `Content` — so this
   rule only has to style it.

   It used to hang off the wrapper as `> p:first-of-type`, which was wrong:
   an eyebrow renders as a <p> too, so on any block that opened with one the
   cap landed on "Act I Before Titan" instead of the story. `:first-of-type`
   counts by TAG, so no amount of class-excluding fixes it — the paragraph has
   to be identified in the data instead.

   `line-height: 0` keeps the larger glyph from adding leading, so it overflows
   upward rather than pushing the next line down. */
const BLOCK_CSS = `
.story-dropcap::first-letter {
  font-size: 1.6em;
  font-weight: 600;
  line-height: 0;
  color: #0E0E0E;
  padding-right: 0.04em;
}
`;

/* ═══════════════════════════════════════════════════════════
   Types — mirror storyBlocks.ts
   ═══════════════════════════════════════════════════════════ */
export interface StoryFact {
  label?: string;
  value?: string;
}
export interface StoryFigure {
  num?: string;
  label?: string;
}
export interface StoryBlock {
  _type: string;
  _key: string;
  /* content */
  body?: PortableTextBlock[];
  dropCap?: boolean;
  /* quote / note */
  text?: string;
  attribution?: string;
  /* picture */
  image?: string;
  caption?: string;
  /* fact bar */
  facts?: StoryFact[];
  ctaLabel?: string;
  ctaUrl?: string;
  /* figures */
  stats?: StoryFigure[];
  footnote?: string;
  /* explore */
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
}

/* ═══════════════════════════════════════════════════════════
   Rich text
   ═══════════════════════════════════════════════════════════ */
const PT: PortableTextComponents = {
  block: {
    /* The style names an editor picks map to the site's own levels, so a
       "Heading — large" is the same size here as a section heading anywhere
       else on the site rather than a number someone typed in. */
    normal: ({ children, value }) => (
      <p
        /* `_dropCap` is set by `Content` on the first body paragraph only. */
        className={`m-0 font-normal text-[#1a1a1a] ${HERO_BODY_CLASS} ${
          (value as { _dropCap?: boolean })?._dropCap ? "story-dropcap" : ""
        }`}
        style={{ ...HERO_BODY_STYLE, lineHeight: 1.75, marginTop: "clamp(10px, 1.2vw, 18px)" }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2
        className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
        style={{ ...SECTION_HEADING_STYLE, marginTop: "clamp(18px, min(1.9vw, 2.8vh), 34px)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
        style={{ ...SUBHEADING_STYLE, marginTop: "clamp(14px, min(1.5vw, 2.2vh), 26px)" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <p
        className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
        style={{ ...LABEL_STYLE, marginTop: "clamp(18px, min(2vw, 2.9vh), 34px)" }}
      >
        {children}
      </p>
    ),
    /* "Small print" — the editor sees that name, not "blockquote". */
    blockquote: ({ children }) => (
      <p
        className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
        style={{ ...CAPTION_STYLE, lineHeight: 1.6, marginTop: "clamp(8px, 1vw, 14px)" }}
      >
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul
        className={`m-0 list-disc font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
        style={{
          ...HERO_BODY_STYLE,
          lineHeight: 1.75,
          marginTop: "clamp(10px, 1.2vw, 18px)",
          paddingLeft: "1.4em",
        }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        className={`m-0 list-decimal font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
        style={{
          ...HERO_BODY_STYLE,
          lineHeight: 1.75,
          marginTop: "clamp(10px, 1.2vw, 18px)",
          paddingLeft: "1.4em",
        }}
      >
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#0E0E0E]">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    textColor: ({ children, value }) => (
      <span style={{ color: (value as { value?: string })?.value || "inherit" }}>
        {children}
      </span>
    ),
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href || "#";
      const external = /^https?:\/\//i.test(href);
      return (
        <Link
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="underline underline-offset-2 transition-opacity duration-200 hover:opacity-70"
        >
          {children}
        </Link>
      );
    },
  },
};

/* ═══════════════════════════════════════════════════════════
   The individual blocks
   ═══════════════════════════════════════════════════════════ */
function Content({ block }: { block: StoryBlock }) {
  /* THE CAP GOES ON THE FIRST BODY PARAGRAPH, not on whatever happens to come
     first. An eyebrow or a heading can open the block, and the opening letter
     of "Act I Before Titan" is not what should be set large.

     It is marked HERE, on the data, rather than by position: Portable Text
     groups consecutive list items into one node, so the index a paragraph is
     rendered at does not always match its index in this array. Reading a flag
     off the block's own value has no such gap. */
  const body = useMemo(() => {
    if (!block.body?.length || !block.dropCap) return block.body;
    let marked = false;
    return block.body.map((b) => {
      const isBody =
        (b as { _type?: string })._type === "block" &&
        ((b as { style?: string }).style ?? "normal") === "normal";
      if (!marked && isBody) {
        marked = true;
        return { ...b, _dropCap: true };
      }
      return b;
    });
  }, [block.body, block.dropCap]);

  if (!body?.length) return null;
  return (
    <motion.div variants={RISE}>
      <PortableText value={body} components={PT} />
    </motion.div>
  );
}

function CreamSlab({
  children,
  attribution,
  withMark,
}: {
  children: React.ReactNode;
  attribution?: string;
  withMark: boolean;
}) {
  return (
    <motion.figure
      variants={RISE}
      className="m-0 flex flex-col"
      style={{
        background: CREAM,
        borderLeft: "3px solid #0E0E0E",
        borderRadius: "0 2px 2px 0",
        padding: "clamp(22px, min(2.6vw, 3.8vh), 44px)",
      }}
    >
      {/* The mark sits BESIDE a column holding the quote and its attribution,
          rather than above a full-width caption. That is what keeps the
          attribution on the same left edge as the quote it belongs to — with
          the caption outside this row it started at the padding edge, one
          mark-width to the left of the text, and read as loose from it. */}
      {/* `items-start`, NOT the default stretch. The mark belongs beside the
          FIRST LINE of the quote, where the sentence begins — centred against
          the whole block it drifted to the middle of a long quote and read as
          a decoration floating in the slab rather than an opening mark. The
          small top offset drops it onto the first line's cap height, since the
          glyph's own box starts above where the letters do. */}
      <div className="flex items-start" style={{ gap: "clamp(12px, 1.4vw, 20px)" }}>
        {withMark && (
          <svg
            viewBox="0 0 42 33"
            fill="none"
            aria-hidden
            className="shrink-0"
            style={{
              width: "clamp(24px, 2.2vw, 38px)",
              height: "auto",
              marginTop: "0.25em",
            }}
          >
            <path
              d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z"
              fill="#0E0E0E"
            />
          </svg>
        )}
        <div
          className="flex min-w-0 flex-col"
          style={{ gap: "clamp(12px, 1.4vw, 22px)" }}
        >
          <blockquote
            className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
            style={{ ...SUBHEADING_STYLE, lineHeight: 1.35 }}
          >
            {children}
          </blockquote>
          {attribution && (
            /* LEVEL 7, a step below the level 6 it used to be: this names the
               speaker, so it should sit under the quote rather than compete
               with it. */
            <figcaption
              className="font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
              style={CAPTION_STYLE}
            >
              {attribution}
            </figcaption>
          )}
        </div>
      </div>
    </motion.figure>
  );
}

function Picture({ block }: { block: StoryBlock }) {
  if (!block.image) return null;
  return (
    <motion.figure variants={RISE} className="m-0 flex w-full flex-col">
      <div
        className="relative w-full overflow-hidden bg-[#f0f0f0]"
        style={{ aspectRatio: "16 / 9", borderRadius: "2px" }}
      >
        <Image
          src={block.image}
          alt={block.caption || ""}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center"
        />
      </div>
      {block.caption && (
        <figcaption
          className="font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
          style={{ ...LABEL_STYLE, marginTop: "clamp(8px, 1vw, 14px)" }}
        >
          {block.caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

function FactBar({ block }: { block: StoryBlock }) {
  const facts = (block.facts ?? []).filter((f) => f.label && f.value);
  if (facts.length === 0 && !block.ctaUrl) return null;
  return (
    <motion.div
      variants={RISE}
      className="mx-auto flex w-full flex-wrap items-center justify-between gap-[clamp(16px,2vw,32px)] max-md:!flex-col max-md:!items-start"
      style={{
        border: "1px solid #E4E0D8",
        borderRadius: "2px",
        padding: "clamp(18px, min(1.8vw, 2.6vh), 30px) clamp(20px, min(2vw, 3vh), 36px)",
      }}
    >
      <div className="flex flex-wrap" style={{ gap: "clamp(20px, 3vw, 54px)" }}>
        {facts.map((f, i) => (
          <div key={i} className="flex flex-col" style={{ gap: "6px" }}>
            <span
              className="font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
              style={LABEL_STYLE}
            >
              {f.label}
            </span>
            <span
              className="font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
              style={LABEL_STYLE}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {block.ctaUrl && (
        <Link
          href={block.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-medium text-white transition-opacity duration-300 hover:opacity-88"
          style={{
            background: NAVY,
            padding: "clamp(10px, min(1.1vw, 1.7vh), 16px) clamp(20px, min(2.2vw, 3.4vh), 34px)",
            ...LABEL_STYLE,
          }}
        >
          {block.ctaLabel || "Visit Site"}
          <span aria-hidden>↗</span>
        </Link>
      )}
    </motion.div>
  );
}

function Figures({ block }: { block: StoryBlock }) {
  const stats = (block.stats ?? []).filter((s) => s.num);
  if (stats.length === 0) return null;
  return (
    <motion.div
      variants={RISE}
      className="w-full"
      style={{
        background: CREAM,
        borderLeft: "3px solid #0E0E0E",
        borderRadius: "0 2px 2px 0",
        padding: "clamp(22px, min(2.6vw, 3.8vh), 40px)",
      }}
    >
      {/* A pure stagger container, at the 0.5s that lets each figure finish
          rolling before the next starts — the same cadence as the portfolio
          bar. */}
      <motion.div
        className="grid w-full max-md:!grid-cols-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))`,
          gap: "clamp(18px, min(2vw, 3vh), 34px)",
        }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.5, delayChildren: 0.1 } },
        }}
      >
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className="flex min-w-0 flex-col items-center text-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
            }}
          >
            <span
              className={`font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
              style={SUBHEADING_STYLE}
            >
              <RollingNumber value={s.num!} />
            </span>
            {s.label && (
              <span
                className="whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
                style={{ ...CAPTION_STYLE, lineHeight: 1.5, marginTop: "clamp(4px, 0.6vw, 10px)" }}
              >
                {s.label}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {block.footnote && (
        <p
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
          style={{ ...CAPTION_STYLE, marginTop: "clamp(14px, 1.6vw, 26px)" }}
        >
          {block.footnote}
        </p>
      )}
    </motion.div>
  );
}

/** The explore band. FULL BLEED — it breaks out of the reading column, which
 *  is why it is rendered outside the column wrapper.
 *
 *  IT TAKES THE CARDS ALREADY RENDERED. The founder stories show founder
 *  cards and the blog shows blog cards; everything around them — the cream
 *  ground, the heading row, the grid — is identical, so the caller supplies
 *  the cards and this supplies the band. */
function Explore({
  block,
  cards,
}: {
  block: StoryBlock;
  cards: React.ReactNode[];
}) {
  if (!block.heading || cards.length === 0) return null;
  return (
    <section
      className="relative w-full"
      style={{
        background: CREAM,
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <motion.div
          className="flex w-full flex-wrap items-baseline justify-between"
          style={{ gap: "clamp(8px, 1.2vw, 20px)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.h2
            variants={RISE}
            className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {block.heading}
          </motion.h2>
          {block.browseLabel && (
            <motion.div variants={RISE}>
              <Link
                href={block.browseHref || "/foundersstory"}
                className="font-['Poppins',_sans-serif] font-medium text-[#3d3d3d] underline-offset-4 transition-colors duration-300 hover:text-[#0E0E0E] hover:underline"
                style={LABEL_STYLE}
              >
                {block.browseLabel}
              </Link>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-3 max-md:!grid-cols-1"
          style={{
            marginTop: "clamp(24px, min(3vw, 4.4vh), 52px)",
            gap: "calc(var(--section-px-wide) * 0.4)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {cards.slice(0, 3)}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   The list
   ═══════════════════════════════════════════════════════════ */
export default function StoryBlocks({
  blocks,
  cards = [],
}: {
  blocks?: StoryBlock[];
  /** The three cards for an Explore block, if the story has one. */
  cards?: React.ReactNode[];
}) {
  const real = blocks ?? [];
  if (real.length === 0) return null;

  /* THE EXPLORE BAND IS FULL BLEED and every other block sits in the reading
     column, so the list is cut into runs: each run of column blocks gets one
     column section, and an explore band is emitted between them. Rendering
     them all inside one wrapper would trap the band in the column; rendering
     each block in its own section would lose the spacing between them. */
  const runs: Array<{ kind: "column"; items: StoryBlock[] } | { kind: "full"; item: StoryBlock }> =
    [];
  for (const b of real) {
    if (b._type === "storyExplore") {
      runs.push({ kind: "full", item: b });
    } else {
      const last = runs[runs.length - 1];
      if (last && last.kind === "column") last.items.push(b);
      else runs.push({ kind: "column", items: [b] });
    }
  }

  const render = (b: StoryBlock) => {
    switch (b._type) {
      case "storyContent":
        return <Content key={b._key} block={b} />;
      case "storyQuote":
        return (
          <CreamSlab key={b._key} withMark attribution={b.attribution}>
            {b.text}
          </CreamSlab>
        );
      case "storyNote":
        return (
          <CreamSlab key={b._key} withMark={false}>
            {b.text}
          </CreamSlab>
        );
      case "storyPicture":
        return <Picture key={b._key} block={b} />;
      case "storyFactBar":
        return <FactBar key={b._key} block={b} />;
      case "storyFigures":
        return <Figures key={b._key} block={b} />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{BLOCK_CSS}</style>
      {runs.map((run, i) =>
        run.kind === "full" ? (
          <Explore key={`x-${i}`} block={run.item} cards={cards} />
        ) : (
          <section
            key={`c-${i}`}
            className="relative w-full bg-white"
            style={{
              paddingBottom: "var(--section-py)",
              paddingLeft: "var(--section-px-wide)",
              paddingRight: "var(--section-px-wide)",
            }}
          >
            <div className="mx-auto w-full" style={{ maxWidth: COLUMN }}>
              <motion.div
                className={`flex w-full flex-col ${INSET}`}
                /* TIGHTENED from a 60px ceiling. Blocks are the editor's
                   paragraphs of the page, not separate sections — at the old
                   spacing a quote sat far enough from the passage it belongs
                   to that the article read as a list of disconnected cards.
                   The type's own margins still separate them within a block. */
                style={{ gap: "clamp(18px, min(2.2vw, 3.2vh), 38px)" }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.08 }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
              >
                {run.items.map(render)}
              </motion.div>
            </div>
          </section>
        )
      )}
    </>
  );
}
