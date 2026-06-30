"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Shared motion variants — same scaleX-highlight + fadeUp
   pattern used by OurTeamClient + LedByFoundersClient.
   ───────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  },
});

const highlightScaleX = (delay = 0.5) => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: "easeInOut" as const, delay },
  },
});

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface OurTeamHeroData {
  titleLine1?: string;
  titleLine2?: string;
  titleLine3?: string;
  description?: string;
  members?: string[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks & Structural Grid Mapping
   ───────────────────────────────────────────────────────── */
const FALLBACK_TITLE_1 = "Builders";
const FALLBACK_TITLE_2 = "Backing";
const FALLBACK_TITLE_3 = "Builders";
const FALLBACK_DESC =
  "We've built companies ourselves. We know the weight of the journey. Now we back the founders building out their dreams.";

// Exactly 12 slots: 5 in Row 1, 4 in Row 2, 3 in Row 3.
// Alternating front/back so each global flip swaps every cell.
const GRID_STRUCTURE = [
  // Row 1 (5 items)
  { frontIsBox: true,  gridClass: "lg:col-start-1 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-2 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "lg:col-start-3 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-4 lg:row-start-1" },
  { frontIsBox: true,  gridClass: "lg:col-start-5 lg:row-start-1" },

  // Row 2 (4 items)
  { frontIsBox: true,  gridClass: "lg:col-start-2 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-3 lg:row-start-2" },
  { frontIsBox: true,  gridClass: "lg:col-start-4 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-5 lg:row-start-2" },

  // Row 3 (3 items)
  { frontIsBox: true,  gridClass: "lg:col-start-3 lg:row-start-3" },
  { frontIsBox: false, gridClass: "lg:col-start-4 lg:row-start-3" },
  { frontIsBox: true,  gridClass: "lg:col-start-5 lg:row-start-3" },
];

const FALLBACK_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/images/team${i + 1}.jpg`
);

/* ─────────────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────────────── */
const Dot = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    className={`absolute z-20 ${className}`}
  >
    <circle cx="5" cy="5" r="5" fill="#323232" />
  </svg>
);

const Photo = ({ src }: { src: string }) => (
  <div className="relative h-full w-full bg-[#f0f0f0]">
    <Image
      src={src}
      alt="Team Member"
      fill
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      className="object-cover object-center"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  </div>
);

const BlueBox = () => <div className="h-[82%] w-[76.5%] bg-[#D3E2FF]" />;

function FlipCard({
  isFlipped,
  frontIsBox,
  imgSrc,
  gridClass,
}: {
  isFlipped: boolean;
  frontIsBox: boolean;
  imgSrc: string;
  gridClass: string;
}) {
  return (
    <div
      // No maxHeight cap — aspect-ratio 205/229 is the only height
      // driver so cards stay as vertical rectangles at every viewport
      // (with 1fr columns) instead of getting squished into squares.
      className={`relative w-full aspect-[205/229] [perspective:1200px] ${gridClass}`}
    >
      <Dot className="-left-[5px] -top-[5px]" />
      <Dot className="-right-[5px] -top-[5px]" />
      <Dot className="-bottom-[5px] -left-[5px]" />
      <Dot className="-bottom-[5px] -right-[5px]" />

      <div
        className={`relative h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden]">
          {frontIsBox ? <BlueBox /> : <Photo src={imgSrc} />}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {frontIsBox ? <Photo src={imgSrc} /> : <BlueBox />}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Client Component

   Layout strategy
   ───────────────
   Section margin/padding matches the standard rhythm used by
   Footer and the other sections — `clamp(40px, min(6.94vw,
   10.18vh), 100px)` for both top + bottom, `var(--section-
   px-wide)` for the sides, max-w-[1440px] inner wrapper.

   To make the whole hero fit in a single viewport across the
   /multiview grid (1097×617 short laptops → 2560×1600
   desktops) we ONLY shrink the cards: the per-column width
   uses `min(vw, vh)` so the grid collapses on short laptops
   while the section padding stays exactly the same as Footer.
   Headings carry a vh component so they back off just enough
   on short screens to keep the text block inside its 2-row
   slot of the grid.
   ───────────────────────────────────────────────────────── */
export default function OurTeamHeroClient({
  data,
}: {
  data?: OurTeamHeroData | null;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const titleLine1 = data?.titleLine1 || FALLBACK_TITLE_1;
  const titleLine2 = data?.titleLine2 || FALLBACK_TITLE_2;
  const titleLine3 = data?.titleLine3 || FALLBACK_TITLE_3;
  const description = data?.description || FALLBACK_DESC;

  const teamItems = GRID_STRUCTURE.map((struct, index) => {
    const cmsImage = data?.members?.[index];
    return {
      ...struct,
      id: index,
      imgSrc: cmsImage || FALLBACK_IMAGES[index],
    };
  });

  useEffect(() => {
    const interval = setInterval(() => setIsFlipped((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative flex w-full flex-col bg-white"
      style={{
        // Identical to Footer + HeroClient — the site-wide section rhythm.
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* Same wrapper as every other section: max-w-[1440px] inner
          container centered by mx-auto, with the section's own padding
          driven by var(--section-px-wide). This means the hero's left
          and right gutters match Footer / Hero / LedByFounders exactly
          — no custom width clamp making it narrower. The grid fits in
          one viewport because each FlipCard carries its own max-height,
          not because the container is narrowed. */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <div
          className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          style={{
            columnGap: "clamp(14px, min(2vw, 2.5vh), 32px)",
            rowGap: "clamp(18px, min(2.4vw, 3vh), 40px)",
          }}
        >
          {/* Row 1 (items 0-4) */}
          {teamItems.slice(0, 5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* TEXT BLOCK — fills the leftmost 2 cells in rows 2-3 on
              desktop. Mobile/tablet shows it as a full-width band.
              Heading group and description are siblings here so the
              cell can use lg:justify-between to push the heading up
              against row 2 and the description down against row 3.
              Mobile keeps the natural top-stacked flow. */}
          <div className="pointer-events-none relative z-10 col-span-2 flex flex-col pt-4 md:col-span-3 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2 lg:justify-between lg:pb-6 lg:pr-6 lg:pt-0">
            {/* Heading group — top of the cell on desktop */}
            <motion.div
              className="pointer-events-auto flex flex-col items-start"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
            >
              <motion.h1
                className="m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                  lineHeight: "118%",
                }}
                variants={fadeUp(0)}
              >
                {titleLine1}
              </motion.h1>

              <motion.div
                // inline-flex + padding (same as LedByFounders) so the
                // cream highlight sizes to fit the italic "Backing"
                // text — no fixed width to clip the letters at any
                // viewport / font scale.
                className="relative my-1 inline-flex items-center justify-center overflow-hidden"
                style={{
                  paddingLeft: "clamp(8px, 1vw, 14px)",
                  paddingRight: "clamp(8px, 1vw, 14px)",
                  paddingTop: "2px",
                  paddingBottom: "2px",
                }}
                variants={fadeUp(0.15)}
              >
                {/* Cream highlight bg — scales in from the left,
                    same pattern as OurTeamClient's italic phrase. */}
                <motion.span
                  className="absolute inset-0 z-0 h-full w-full bg-[#FBF7F0]"
                  style={{ transformOrigin: "left" }}
                  variants={highlightScaleX(0.55)}
                />
                <h1
                  className="relative z-10 m-0 font-['Libre_Baskerville',_serif] font-semibold italic text-[#0E0E0E]"
                  style={{
                    fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                    lineHeight: "118%",
                  }}
                >
                  {titleLine2}
                </h1>
              </motion.div>

              <motion.h1
                className="m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(28px, min(4.4vw, 5.4vh), 56px)",
                  lineHeight: "118%",
                }}
                variants={fadeUp(0.3)}
              >
                {titleLine3}
              </motion.h1>
            </motion.div>

            {/* Description — bottom of the cell on desktop, normal flow
                below the heading on mobile. */}
            <motion.p
              className="pointer-events-auto m-0 font-['Poppins',_sans-serif] font-normal text-[#000]"
              style={{
                marginTop: "clamp(12px, min(1.4vw, 1.8vh), 24px)",
                maxWidth: "clamp(220px, min(28vw, 100%), 420px)",
                fontSize: "clamp(13px, min(1.5vw, 1.8vh), 20px)",
                lineHeight: "150%",
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp(0.45)}
            >
              {description}
            </motion.p>
          </div>

          {/* Rows 2-3 (items 5-11) */}
          {teamItems.slice(5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}
        </div>
      </div>
    </section>
  );
}
