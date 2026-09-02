"use client";

import { useRef } from "react";
import { storySlug, type FounderStoryCard } from "@/lib/founderStory";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  SeeMoreButton,
  padStories,
  type FounderStory,
} from "./ImpactAtGlanceClient";
import FounderQuoteCard from "./FounderQuoteCard";
import { SECTION_HEADING_CLASS, SECTION_HEADING_STYLE } from "@/styles/heroTypography";

/*
  FoundersStoryGrid
  ─────────────────
  The same 3-column grid and scroll-linked dividers as ImpactAtGlance's
  "Their Stories" section, extended to 4 rows (12 cards). Grid, gaps and
  divider geometry are unchanged.

  The CARD is not the same, though. This page uses FounderQuoteCard — logo in
  the top-left corner and the quote across the foot, both visible at rest —
  where the home page keeps its hover-reveal StoryCard. They are separate
  components on purpose: editing the shared one would have rewritten the home
  page's section too.
*/

const ROWS = 4;
const CARD_COUNT = ROWS * 3; // 12

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
const BORDER_PADDING = "calc(var(--section-px-wide) * 0.2)";

export interface FoundersStoryGridProps {
  heading: string;
  ctaLabel: string;
  slides: FounderStoryCard[];
}

export default function FoundersStoryGrid({
  heading,
  ctaLabel,
  slides,
}: FoundersStoryGridProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const smoothLineProgress = useSpring(lineProgress, { stiffness: 40, damping: 25 });
  const vRuleScale = smoothLineProgress;
  const hRuleScale = smoothLineProgress;

  // Row-boundary lines centered exactly in each row gap. With square
  // cards, row height = (innerH - (ROWS-1)*gap) / ROWS where innerH is
  // (100% - 2*bp). The k-th gap centre = bp + k*cardH + (k-0.5)*gap, so
  // padding above/below every line is exactly gap/2 (consistent).
  const hLineTops = [1, 2, 3].map(
    (k) =>
      `calc(var(--bp) + ${k} * ((100% - 2 * var(--bp) - ${ROWS - 1} * var(--gap)) / ${ROWS}) + ${k - 0.5} * var(--gap))`
  );
  // Column-boundary lines centered in each column gap (3 columns → 2 lines).
  const vLineLefts = [1, 2].map(
    (j) =>
      `calc(var(--bp) + ${j} * ((100% - 2 * var(--bp) - 2 * var(--gap)) / 3) + ${j - 0.5} * var(--gap))`
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        background: "#FFF",
        overflow: "hidden",
        zIndex: 10,
        paddingTop: "min(5.79vw, 8.95vh)",
        paddingBottom: "min(5.79vw, 8.95vh)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.18, delayChildren: 0.45 } },
        }}
      >
        {/* ── HEADING ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          /* LEFT-ALIGNED, matching the Featured Stories band above it. It was
             centred, which read as a different section rather than the next
             one down the same page. */
          className="flex w-full flex-col items-start max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{ marginBottom: "min(3.47vw, 5.37vh)" }}
        >
          {/* ONE HEADING, and the line breaks are the editor's. It used to be
              two fields with the second welded onto its own line, so the
              heading was always two lines whatever was typed. `whitespace-pre-line`
              means one line stays one line and pressing Enter gives another. */}
          <h2
            className={`m-0 whitespace-pre-line text-left text-black ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {heading}
          </h2>
        </motion.div>

        {/* ── GRID + DIVIDERS ── */}
        <div
          className="relative w-full"
          style={{ padding: BORDER_PADDING, "--bp": BORDER_PADDING, "--gap": STORY_GAP } as React.CSSProperties}
        >
          <div
            className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[24px]"
            style={{ gap: STORY_GAP }}
          >
            {padStories(slides, CARD_COUNT).map((story, i) => (
              <Link key={`${story.name}-${i}`} href={`/foundersstory/${storySlug(story)}`} className="block">
                <FounderQuoteCard story={story} />
              </Link>
            ))}
          </div>

          {/* Horizontal dividers between rows (split left/right for the
              symmetric draw-out reveal) */}
          {hLineTops.map((top, idx) => (
            <div key={`h-${idx}`}>
              <motion.div
                aria-hidden
                className="pointer-events-none absolute max-md:!hidden z-20"
                style={{
                  top,
                  left: "var(--bp)",
                  width: "calc(50% - var(--bp))",
                  height: 0,
                  borderTop: "1px solid #000",
                  transformOrigin: "left",
                  scaleX: hRuleScale,
                }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute max-md:!hidden z-20"
                style={{
                  top,
                  right: "var(--bp)",
                  width: "calc(50% - var(--bp))",
                  height: 0,
                  borderTop: "1px solid #000",
                  transformOrigin: "right",
                  scaleX: hRuleScale,
                }}
              />
            </div>
          ))}

          {/* Vertical dividers between columns (full inner height) */}
          {vLineLefts.map((left, idx) => (
            <motion.div
              key={`v-${idx}`}
              aria-hidden
              className="pointer-events-none absolute max-md:!hidden z-20"
              style={{ top: "var(--bp)", left, width: 0, borderLeft: "1px solid #000", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top", scaleY: vRuleScale }}
            />
          ))}
        </div>

        {/* ── SEE MORE ── */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
          style={{ marginTop: "min(3.47vw, 5.37vh)" }}
        >
          <SeeMoreButton label={ctaLabel} />
        </motion.div>
      </motion.div>
    </section>
  );
}
