"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurStoryHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface OurStoryHeroData {
  headingFirst?: string;
  headingHighlight?: string;
  quote?: string;
  image?: string;
}

/* ─────────────────────────────────────────────────────────
   Fallbacks — used when Sanity is empty or unreachable.
   The image path is where the user said they'll drop the
   founders photo locally: /public/images/ourstory/...
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "Built by people who've been";
const FALLBACK_HEADING_HIGHLIGHT = "where you are today.";
const FALLBACK_QUOTE =
  "We didn't start Titan Capital because we wanted to be investors. We started it because we wanted to keep helping founders, and this was the best way we knew how.";
const FALLBACK_IMAGE = "/images/ourstory/ourstoryhero.png";

/**
 * Adds Sanity CDN transform params for responsive sizing. Pass-through for
 * local /public paths.
 */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

export default function OurStoryHeroClient({
  data,
}: {
  data?: OurStoryHeroData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingHighlight = data?.headingHighlight || FALLBACK_HEADING_HIGHLIGHT;
  const quote = data?.quote || FALLBACK_QUOTE;
  const image = data?.image || FALLBACK_IMAGE;

  return (
    <section
      // Mirrors the rest of the site's hero pattern (see WinnersHero,
      // HeroClient): sits below the fixed navbar, fills one viewport
      // height on most screens, no bottom padding so the image hugs
      // the section bottom edge.
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#D9C9B9]"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(24px, min(4vw, 5.5vh), 80px)",
        paddingBottom: "0",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <div className="relative mx-auto flex w-full max-w-[1330px] flex-1 flex-col items-center">
        {/* ── TOP SPACER — pushes heading + image to the bottom of the
               section so heading sits right above the image (touching),
               with the empty cream space above. ── */}
        <div aria-hidden className="w-full flex-1" />

        {/* ── HEADING — two stacked lines, italic second line on a
               cream pill that slides in from the left. Same scaleX +
               variants pattern WinnersHero uses for its heading. ── */}
        <motion.div
          className="flex flex-col items-center text-center"
          style={{
            gap: "clamp(6px, min(0.6vw, 0.9vh), 10px)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h1
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[120%] text-[#0E0E0E] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            {headingFirst}
          </motion.h1>

          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[6px] md:px-[10px] md:py-[8px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#FBF7F0]"
              style={{ transformOrigin: "left", borderRadius: "4px" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                    delay: 0.8,
                  },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[120%] text-[#0E0E0E] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              {headingHighlight}
            </span>
          </motion.div>
        </motion.div>

        {/* ── FOUNDERS IMAGE — heading sits flush against its top edge
               (no spacer between). Image hugs the section bottom edge
               thanks to the top flex-1 spacer + zero section padding-
               bottom. Width clamps with min(vw, vh) so on short-height
               laptops the image shrinks instead of overflowing.
               Aspect ratio 198/169 locked. ── */}
        <motion.div
          className="relative mx-auto w-full"
          style={{
            width: "clamp(280px, min(90vw, 80vh), 1000px)",
            aspectRatio: "198 / 169",
            maxWidth: "100%",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
        >
          <Image
            src={cdnImageSrc(image, 1400)}
            alt="Titan Capital founders"
            fill
            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 65vw, 717px"
            priority
            className="object-cover"
          />

          {/* ── QUOTE BUBBLE — overlaid at the bottom of the image with
                 large quotation marks flanking it. Width is decoupled
                 from the image so it can extend past the image edges
                 (matching the 810px design spec). At full size the
                 quote wraps to exactly 3 lines. ── */}
          <motion.div
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
            style={{
              bottom: "clamp(40px, min(7vw, 9vh), 80px)",
              width: "clamp(260px, min(70vw, 80vh), 700px)",
              gap: "clamp(10px, min(1.4vw, 2vh), 28px)",
            }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}
          >
            {/* Opening quotation mark */}
            <span
              aria-hidden
              className="select-none font-['Poppins',_sans-serif] font-medium leading-none text-[#1E1E1E]"
              style={{
                fontSize: "clamp(32px, min(5vw, 7.3vh), 96px)",
                marginTop: "-0.15em",
              }}
            >
              &ldquo;
            </span>

            {/* Quote pill */}
            <p
              className="m-0 flex-1 text-center font-['Poppins',_sans-serif] font-medium text-white"
              style={{
                fontSize: "clamp(11px, min(1.25vw, 1.85vh), 20px)",
                lineHeight: "120%",
                padding:
                  "clamp(8px, min(1.1vw, 1.6vh), 18px) clamp(10px, min(1.4vw, 2vh), 22px)",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.36)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {quote}
            </p>

            {/* Closing quotation mark */}
            <span
              aria-hidden
              className="select-none font-['Poppins',_sans-serif] font-medium leading-none text-[#1E1E1E]"
              style={{
                fontSize: "clamp(32px, min(5vw, 7.3vh), 96px)",
                marginTop: "-0.15em",
              }}
            >
              &rdquo;
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
