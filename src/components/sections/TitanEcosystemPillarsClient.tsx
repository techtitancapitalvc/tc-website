"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import PartVisual, {
  VISUAL_KEYFRAMES,
  VISUAL_SIZE,
  type VisualKind,
} from "./TitanEcosystemVisuals";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /titanEcosystem — the long dark rail beneath the hero.
 *
 * Several parts stacked down a vertical line that DRAWS ITSELF as the section
 * scrolls, with a ringed pointer riding the line's growing tip. Opposite each
 * part's copy sits an orbit diagram that grows from a single dot into a ring
 * of six and back again, forever.
 *
 * TWO INDEPENDENT CLOCKS, deliberately:
 *   - the line and the pointer are driven by SCROLL POSITION, so they are a
 *     pure function of where the reader is and reverse perfectly on the way
 *     back up;
 *   - the orbit runs on its own CSS keyframe loop, so the diagram is alive
 *     even when the page is still. Scroll-driving it would freeze the whole
 *     section the moment the reader stopped.
 *
 * LAYOUT. Desktop puts the line down the centre with copy left and diagram
 * right. Mobile moves the line to the far left and stacks copy over diagram
 * beside it — a centred line with two columns either side is unreadable at
 * phone widths.
 */

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — whatever the CMS
   doesn't supply falls back to the constants below.
   ───────────────────────────────────────────────────────── */
export interface TitanEcosystemPart {
  title?: string;
  description?: string;
  visual?: VisualKind;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface TitanEcosystemPillarsData {
  heading?: string;
  parts?: TitanEcosystemPart[];
}

const FALLBACK_HEADING = "Titan Ecosystem";

const FALLBACK_BODY =
  "300+ Startups. 500+ Founders. One Family. Being Part Of The Titan Founders Family Means Access To A Trusted, High-Calibre Community Of Builders Who've Faced The Same Walls You're Hitting Right Now.";

const FALLBACK_PARTS: TitanEcosystemPart[] = [
  {
    title: "Titan Founders\nCommunity",
    description: FALLBACK_BODY,
    visual: "orbit",
  },
  {
    title: "The Titan Expert\nCommunity",
    description: FALLBACK_BODY,
    visual: "mandala",
  },
  {
    title: "Titan Job Network",
    description: FALLBACK_BODY,
    visual: "web",
    ctaLabel: "Join Community",
    ctaUrl: "/getInvestment",
  },
  {
    title: "Titan Connect",
    description: FALLBACK_BODY,
    visual: "monogram",
  },
];

/** The pointer that rides the scroll line, at the 40px the design specifies
 *  (40px = 2.31vw at the 1728x1117 reference). */
const POINTER = "clamp(24px, min(2.31vw, 3.58vh), 40px)";

const LINE = "rgba(255,255,255,0.22)";

/**
 * HOW FAR EACH HALF STOPS SHORT OF THE CENTRE LINE.
 *
 * The copy and the diagram must use the SAME value: the copy applies it as
 * padding on its line-facing side, and the diagram applies the identical
 * padding on its own. That makes every part a mirror about the line — the same
 * gap to it from both sides, and the diagram comes out the same width as the
 * copy.
 *
 * It is written out longhand at all four call sites, and cannot be hoisted
 * into a constant: Tailwind generates classes by scanning the source for
 * LITERAL strings, so `md:pl-[${INSET}]` produces a class name at runtime that
 * was never compiled and silently does nothing. Change one, change all four.
 *
 *     md:pl-[clamp(32px,min(4.5vw,7vh),80px)]
 *     md:pr-[clamp(32px,min(4.5vw,7vh),80px)]
 */

export default function TitanEcosystemPillarsClient({
  data,
}: {
  data?: TitanEcosystemPillarsData | null;
}) {
  const heading = data?.heading || FALLBACK_HEADING;
  const parts =
    data?.parts && data.parts.length > 0 ? data.parts : FALLBACK_PARTS;

  const railRef = useRef<HTMLDivElement>(null);

  /* Progress across the rail. The offsets start the line as the rail's top
     reaches the middle of the screen and finish as its bottom does, so the
     pointer is always somewhere the reader is actually looking. */
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start center", "end center"],
  });

  /* Softened before it drives anything: raw scroll is stepped on a wheel, and
     a pointer bound straight to it stutters. */
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  const lineScaleY = progress;
  const pointerTop = useTransform(progress, (p) => `${p * 100}%`);
  /* The glow swells as the pointer moves and settles at either end. */
  const pointerGlow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "0 0 12px rgba(255,255,255,0.35)",
      "0 0 26px rgba(150,190,255,0.75)",
      "0 0 12px rgba(255,255,255,0.35)",
    ]
  );

  return (
    <section
      className="relative w-full overflow-hidden bg-[#00112E] font-['Poppins',_sans-serif]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{VISUAL_KEYFRAMES(VISUAL_SIZE)}</style>

      {/* Ambient glow behind the copy, matching the design's lit left side.
          Sized in % of the section so it cannot spill sideways and create the
          stray blobs a vw-sized glow leaves on tall mobile sections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/4 z-0 max-md:hidden"
        style={{
          width: "55%",
          height: "50%",
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(37,84,196,0.45) 0%, rgba(10,40,120,0.18) 45%, transparent 72%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        {/* ── SECTION HEADING ── */}
        <motion.h2
          className={`m-0 text-center font-semibold text-white ${SECTION_HEADING_CLASS}`}
          style={{
            ...SECTION_HEADING_STYLE,
            marginBottom: "clamp(40px, min(5vw, 7.7vh), 86px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {heading}
        </motion.h2>

        {/* ── THE RAIL ──
            `--rail-x` is the line's horizontal position, and everything that
            has to sit on the line reads from it, so the track, the drawn line
            and the pointer can never drift apart. */}
        <div
          ref={railRef}
          className="relative"
          style={
            {
              "--rail-x": "50%",
              "--rail-x-mobile": "clamp(14px, 5vw, 26px)",
            } as React.CSSProperties
          }
        >
          {/* Unlit track — the full path, faint. */}
          <div
            aria-hidden
            className="absolute top-0 z-0 h-full w-[1px] max-md:!left-[var(--rail-x-mobile)]"
            style={{ left: "var(--rail-x)", background: LINE }}
          />

          {/* The line drawing itself. scaleY from a top origin, per the site's
              rule that every divider animates its scale rather than fading. */}
          <motion.div
            aria-hidden
            className="absolute top-0 z-0 h-full w-[1px] origin-top max-md:!left-[var(--rail-x-mobile)]"
            style={{
              left: "var(--rail-x)",
              scaleY: lineScaleY,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(150,190,255,0.85) 100%)",
            }}
          />

          {/* Pointer — 40px ring, 1px white stroke, riding the line's tip. */}
          <motion.div
            aria-hidden
            className="absolute z-20 rounded-full max-md:!left-[var(--rail-x-mobile)]"
            style={{
              left: "var(--rail-x)",
              top: pointerTop,
              width: POINTER,
              height: POINTER,
              x: "-50%",
              y: "-50%",
              border: "1px solid #FFF",
              background: "rgba(0,17,46,0.75)",
              boxShadow: pointerGlow,
            }}
          />

          {/* ── PARTS ──
              The columns SWAP every other part: copy left / diagram right,
              then diagram left / copy right. Done with grid `order` rather
              than by reordering the JSX, so the DOM keeps a single reading
              order — heading, then its copy, then its diagram — no matter
              which side each lands on visually. */}
          {parts.map((part, i) => {
            const diagramLeft = i % 2 === 1;
            /* The two landscape diagrams mirror the copy; the two circular
               ones stay centred in their half. See the cell below. */
            const wide = part.visual === "web" || part.visual === "monogram";
            return (
              <div
                key={i}
                className="relative grid items-center gap-[var(--part-gap)] md:grid-cols-2 max-md:pl-[clamp(44px,14vw,72px)]"
                style={{
                  /* Hoisted so the diagram cell can cancel it — see below. */
                  ["--part-gap" as string]: "clamp(28px, min(4vw, 6vh), 72px)",
                  /* Generous, because the rail's length is what gives the line
                     something to draw across. */
                  paddingTop: i === 0 ? 0 : "clamp(56px, min(7vw, 11vh), 128px)",
                  paddingBottom: "clamp(56px, min(7vw, 11vh), 128px)",
                }}
              >
                {/* Copy — padded on whichever side faces the centre line. */}
                <motion.div
                  className={`flex flex-col ${
                    diagramLeft
                      ? "md:order-2 md:pl-[clamp(32px,min(4.5vw,7vh),80px)]"
                      : "md:order-1 md:pr-[clamp(32px,min(4.5vw,7vh),80px)]"
                  }`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3
                    className={`m-0 whitespace-pre-line font-semibold text-white ${SUBHEADING_CLASS}`}
                    style={SUBHEADING_STYLE}
                  >
                    {part.title}
                  </h3>

                  {/* Divider — scales out from the left on entrance. */}
                  <motion.div
                    aria-hidden
                    className="h-[1px] w-full origin-left"
                    style={{
                      background: LINE,
                      marginTop: "clamp(14px, min(1.8vw, 2.8vh), 31px)",
                      marginBottom: "clamp(14px, min(1.8vw, 2.8vh), 31px)",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.15,
                    }}
                  />

                  <p
                    className={`m-0 font-normal text-white/70 ${HERO_BODY_CLASS}`}
                    style={HERO_BODY_STYLE}
                  >
                    {part.description}
                  </p>

                  {part.ctaLabel && (
                    <Link
                      href={part.ctaUrl || "#"}
                      className="mt-[clamp(20px,min(2.4vw,3.7vh),42px)] inline-flex w-fit items-center justify-center rounded-full bg-white text-[#00112E] transition-colors duration-300 hover:bg-[#DCE8FF]"
                      style={{
                        padding:
                          "clamp(10px, min(1.1vw, 1.7vh), 18px) clamp(20px, min(2.2vw, 3.4vh), 38px)",
                        fontWeight: 600,
                        fontSize: "clamp(12px, min(1.26vw, 2.0vh), 17px)",
                      }}
                    >
                      {part.ctaLabel}
                    </Link>
                  )}
                </motion.div>

                {/* Diagram — centred between the LINE and the outer gutter.
                    Centring in the grid cell alone is not that: the gutter
                    puts the cell's inner edge half a gap away from the line,
                    which lands the diagram gap/4 (16.5px at 1728) off centre.
                    Pulling the cell back by half a gap ON ITS INNER SIDE makes
                    its box run exactly from the line to the outer edge, so
                    centring in it is centring in that half of the page. The
                    side that gets the negative margin flips with the column. */}
                <motion.div
                  className={`flex justify-center ${
                    diagramLeft
                      ? "md:order-1 md:mr-[calc(-0.5*var(--part-gap))]"
                      : "md:order-2 md:ml-[calc(-0.5*var(--part-gap))]"
                  } ${
                    wide
                      ? diagramLeft
                        ? "md:pr-[calc(0.5*var(--part-gap)+clamp(32px,min(4.5vw,7vh),80px))]"
                        : "md:pl-[calc(0.5*var(--part-gap)+clamp(32px,min(4.5vw,7vh),80px))]"
                      : ""
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PartVisual kind={part.visual || "orbit"} />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
