"use client";

import { motion } from "framer-motion";
import {
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /titanEcosystem page hero.
 *
 * Heading, a stack of overlapping founder avatars with a count beside them,
 * and a description. Black type on white.
 *
 * HEADING LEVEL 2 (HERO_HEADING_LIGHT_*) — the step for dark type on a light
 * background, which is also what every other white hero on the site uses.
 *
 * It replaced level 1, which was too wide to hold the design's two-line break
 * on a tall screen: at 1728x1117 level 1 resolves to 170px, and
 * "MORE THAN CAPITAL," needs 1861px of one-line width against a 1440px
 * container — so the first line wrapped and the heading rendered as three
 * lines instead of two. Level 1 only fitted on the short viewport the mockup
 * was captured at, where its `15.2vh` term held it near 112px.
 *
 * The description is LEVEL 5 (HERO_BODY_*), the standard description size.
 */

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — whatever the CMS
   doesn't supply falls back to the constants below, so the
   section never renders empty.
   ───────────────────────────────────────────────────────── */
export interface TitanEcosystemHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  founderCountLabel?: string;
  founderAvatars?: string[];
  description?: string;
}

const FALLBACK_HEADING_LINE_ONE = "More Than Capital,";
const FALLBACK_HEADING_LINE_TWO = "A Community";
const FALLBACK_FOUNDER_COUNT = "500+ founders";
const FALLBACK_DESCRIPTION =
  "Over 15 years, Titan Capital has built something that can't be replicated: a living, breathing community of 500+ founders who help each other win. This is the Titan Ecosystem.";

/**
 * How many circles to draw when the CMS has no photos yet. They render as the
 * flat #D9D9D9 the design specifies as the image's backing colour, so an empty
 * state still reads as the stack rather than as a gap.
 */
const PLACEHOLDER_AVATARS = 5;

/**
 * Avatar geometry. The design gives a flat 65px square; the site's rule is
 * that fixed pixel sizes become `min(vw, vh)` against the 1728x1117 reference
 * so they shrink on small and SHORT screens alike. 65px is 3.76vw / 5.82vh
 * there, so this resolves to exactly 65px at the reference and is capped so it
 * can never grow past the spec on a large monitor.
 */
const AVATAR_SIZE = "clamp(38px, min(3.76vw, 5.82vh), 65px)";
/** Overlap. Negative margin on every circle but the first. */
const AVATAR_OVERLAP = "calc(-0.34 * clamp(38px, min(3.76vw, 5.82vh), 65px))";

/* House motion: cubic-bezier(0.22, 1, 0.36, 1), unhurried, layered. */
const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export default function TitanEcosystemHeroClient({
  data,
}: {
  data?: TitanEcosystemHeroData | null;
}) {
  const headingLineOne = data?.headingLineOne || FALLBACK_HEADING_LINE_ONE;
  const headingLineTwo = data?.headingLineTwo || FALLBACK_HEADING_LINE_TWO;
  const founderCountLabel = data?.founderCountLabel || FALLBACK_FOUNDER_COUNT;
  const description = data?.description || FALLBACK_DESCRIPTION;

  /* `null` means "draw the grey placeholder circle". Filtering out empty
     entries first stops a half-filled CMS array rendering a broken image. */
  const avatars: (string | null)[] =
    data?.founderAvatars && data.founderAvatars.filter(Boolean).length > 0
      ? data.founderAvatars.filter(Boolean)
      : Array.from({ length: PLACEHOLDER_AVATARS }, () => null);

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white"
      style={{
        /* The white background starts at the very top so it fills behind the
           transparent navbar; content clears the nav with paddingTop. */
        minHeight: "78svh",
        paddingTop: "calc(var(--nav-height) + var(--section-py))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ── HEADING ──
            Two fields rather than one string with a line break, so the two
            lines can never collapse onto one at an awkward width. */}
        <motion.h1
          variants={rise}
          className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
          style={HERO_HEADING_LIGHT_STYLE}
        >
          {headingLineOne}
          <br />
          {headingLineTwo}
        </motion.h1>

        {/* ── FOUNDER COUNT ──
            The avatars are decorative and carry no names, so the stack is
            hidden from assistive tech and the count alone conveys it. */}
        <motion.div
          variants={rise}
          className="flex items-center justify-center"
          style={{
            marginTop: "clamp(16px, min(1.9vw, 2.9vh), 33px)",
            gap: "clamp(10px, min(1.1vw, 1.7vh), 19px)",
          }}
        >
          <div aria-hidden className="flex items-center">
            {avatars.map((src, i) => (
              <div
                key={i}
                className="shrink-0 rounded-full bg-[#D9D9D9] bg-cover bg-center bg-no-repeat"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  backgroundImage: src ? `url(${src})` : undefined,
                  marginLeft: i === 0 ? 0 : AVATAR_OVERLAP,
                  /* Each circle sits above the one to its right, so the stack
                     reads left-to-right the way the design shows it. */
                  zIndex: avatars.length - i,
                  /* A white ring keeps the overlapping edges legible against
                     one another; without it the faces merge into a blob. */
                  boxShadow: "0 0 0 2px #FFFFFF",
                }}
              />
            ))}
          </div>

          <span
            className={`font-medium text-[#0E0E0E] ${HERO_BODY_CLASS}`}
            style={HERO_BODY_STYLE}
          >
            {founderCountLabel}
          </span>
        </motion.div>

        {/* ── DESCRIPTION ── */}
        <motion.p
          variants={rise}
          className={`m-0 font-normal text-[#0E0E0E] ${HERO_BODY_CLASS}`}
          style={{
            ...HERO_BODY_STYLE,
            marginTop: "clamp(18px, min(2.2vw, 3.4vh), 38px)",
            /* Caps the measure so the copy stays readable on wide monitors
               instead of running the full 1440px container. */
            maxWidth: "min(1040px, 100%)",
          }}
        >
          {description}
        </motion.p>
      </motion.div>
    </section>
  );
}
