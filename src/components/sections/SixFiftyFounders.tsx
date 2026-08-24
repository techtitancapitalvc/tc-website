"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
} from "@/styles/heroTypography";

/**
 * /foundersstory — the closing band. "650+ Founders. One Extended Team" over a
 * wall of founder portraits.
 *
 * TYPE. The heading is LEVEL 3, the standard non-hero section heading, even
 * though it sits on navy like a hero would. Level 1 and 2 are hero sizes and
 * this is not the page's hero — using one here would make the closing band
 * shout louder than "A Central Hub For Founders" at the top.
 *
 * THE WALL is a fixed 12 x 3 grid on desktop, as designed. It steps down at
 * the breakpoints rather than reflowing freely, because a wall of portraits
 * only reads as a wall when the rows are full — an auto-fill grid leaves a
 * ragged last row at most widths, which reads as missing people.
 */

const COLS = 12;
const ROWS = 3;

/** Cycled to fill the wall until real portraits are wired up. */
const FALLBACK_FACES = [
  "/images/FoundersStory/founder1.webp",
  "/images/FoundersStory/founder2.webp",
  "/images/FoundersStory/founder3.webp",
  "/images/FoundersStory/founder4.webp",
];

export interface SixFiftyFoundersData {
  headingTop?: string;
  headingBottom?: string;
  faces?: string[];
}

const FALLBACK_HEADING_TOP = "650+ Founders.";
const FALLBACK_HEADING_BOTTOM = "One Extended Team";

export default function SixFiftyFounders({
  data,
}: {
  data?: SixFiftyFoundersData | null;
}) {
  const headingTop = data?.headingTop || FALLBACK_HEADING_TOP;
  const headingBottom = data?.headingBottom || FALLBACK_HEADING_BOTTOM;
  const faces = data?.faces?.length ? data.faces : FALLBACK_FACES;

  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => faces[i % faces.length]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#00112E]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Ambient glow, sized in % of the section so it cannot spill sideways
          and leave stray blobs on a tall mobile layout. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 12% 40%, rgba(37,84,196,0.42) 0%, transparent 55%), radial-gradient(ellipse at 88% 70%, rgba(37,84,196,0.32) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center">
        <motion.h2
          className={`m-0 text-center font-semibold text-white ${SECTION_HEADING_CLASS}`}
          style={{
            ...SECTION_HEADING_STYLE,
            marginBottom: "clamp(28px, min(3.4vw, 5vh), 60px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {headingTop}
          <br />
          {headingBottom}
        </motion.h2>

        {/* THE WALL. One stagger across the whole grid rather than per row, so
            the faces arrive as a spreading field instead of three sweeps. */}
        <motion.div
          className="grid w-full grid-cols-6 md:grid-cols-9 lg:grid-cols-12"
          style={{ gap: "clamp(6px, 0.8vw, 14px)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.022, delayChildren: 0.15 } },
          }}
        >
          {tiles.map((src, i) => (
            <motion.div
              key={i}
              className="relative w-full overflow-hidden bg-white"
              /* Square tiles, per the design. aspect-ratio rather than a fixed
                 height so every column stays square at every breakpoint. */
              style={{ aspectRatio: "1", borderRadius: "2px" }}
              variants={{
                hidden: { opacity: 0, scale: 0.82 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <Image
                src={src}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 768px) 16vw, (max-width: 1024px) 11vw, 8vw"
                className="object-cover object-center"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
