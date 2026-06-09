"use client";

import { motion, Variants } from "framer-motion";

const lookForData = [
  {
    title: "A founder with genuine insight.",
    desc: "You understand your customer's problem better than anyone. Not just from research, but from experience, obsession, or lived reality.",
  },
  {
    title: "A differentiated approach.",
    desc: "Technology, distribution, or business model edge. Something that makes your company structurally hard to copy.",
  },
  {
    title: "Ambition to build a lasting, enduring business.",
    desc: "Building for 10 years, not for the next fundraise. Something that outlasts any one cycle.",
  },
  {
    title: "Integrity and coachability.",
    desc: "We'll push you, challenge you, and occasionally disagree with you. We need founders who can handle that, and push back when they're right.",
  },
];

export default function WhatWeLookFor() {
  // ── ANIMATION VARIANTS ──
  // Instead of staggerChildren (which breaks when split into two columns), 
  // we manually calculate the delay using the item's original index to preserve L->R sequence.

  const getItemVariants = (index: number): Variants => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.2 + index * 0.15 },
    },
  });

  const getBoxVariants = (index: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.2 + index * 0.15 },
    },
  });

  const getTickVariants = (index: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.7 + index * 0.15, // Starts slightly after the box renders
      },
    },
  });

  // Reusable item renderer so we don't duplicate code across mobile/desktop blocks
  const renderItem = (item: typeof lookForData[0], index: number, keyPrefix: string) => (
    <motion.div
      key={`${keyPrefix}-${index}`}
      variants={getItemVariants(index)}
      className="flex w-full flex-row items-start gap-[clamp(12px,1.5vw,20px)]"
    >
      {/* ── ICON ── */}
      <div className="shrink-0 pt-[2px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 97 97"
          fill="none"
          className="w-[clamp(40px,5vw,64px)] h-[clamp(40px,5vw,64px)]"
        >
          <motion.path variants={getBoxVariants(index)} d="M30 16 H 22 A 6 6 0 0 0 16 22 V 30" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M16 67 V 75 A 6 6 0 0 0 22 81 H 30" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M67 81 H 75 A 6 6 0 0 0 81 75 V 67" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path variants={getBoxVariants(index)} d="M81 30 V 22 A 6 6 0 0 0 75 16 H 67" stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <motion.path
            variants={getTickVariants(index)}
            d="M20.0801 58.2296C20.0801 58.2296 26.1038 58.2296 34.1355 72.285C34.1355 72.285 56.4595 35.4719 76.3018 28.1108"
            stroke="#111"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── TEXT CONTENT ── */}
      {/* min-height removed so it hugs the text, fixing the inconsistent padding */}
      <div className="flex w-full max-w-[480px] flex-col items-start justify-start gap-[6px]">
        <h3 className="font-['Poppins',_sans-serif] text-left font-medium leading-[115%] text-[#001A4D] text-[clamp(15px,1.6vw,22px)]">
          {item.title}
        </h3>
        <p className="font-['Poppins',_sans-serif] font-normal leading-[145%] text-[#555] text-[clamp(12px,1.2vw,16px)]">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(-10px, min(-1.94vw, -2.18vh), -50px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">

        {/* ── HEADING ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-[clamp(30px,4.5vw,52px)] flex w-full flex-row flex-wrap items-center gap-x-3 max-md:gap-x-2"
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
            variants={{
              hidden: { opacity: 0, x: -40 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: "easeOut" } }
            }}
          >
            What We
          </motion.h2>
          <motion.span
            className="relative inline-flex items-center justify-center overflow-hidden px-[4px] py-[8px] md:px-[6px] md:py-[10px] bg-transparent"
            variants={{
              hidden: { opacity: 0, x: -80 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } }
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 bg-[#D3E2FF] h-full w-full"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.7 } }
              }}
            />
            <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
              Look for
            </span>
          </motion.span>
        </motion.div>

        {/* ── CONTENT (TWO COLUMNS) ── */}
        {/* We use whileInView here to trigger all the manually-delayed item animations at once */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="w-full"
        >
          {/* MOBILE: Single stacked column */}
          <div className="flex w-full flex-col gap-y-[clamp(24px,4vw,44px)] md:hidden">
            {lookForData.map((item, i) => renderItem(item, i, "mob"))}
          </div>

          {/* DESKTOP: Two independent vertical columns to fix padding */}
          <div className="hidden w-full flex-row items-start gap-x-[clamp(24px,4vw,48px)] md:flex">
            {/* Left Column (Evens: 0, 2, 4) */}
            <div className="flex flex-1 flex-col gap-y-[clamp(24px,4vw,44px)]">
              {lookForData.map((item, i) => (i % 2 === 0 ? renderItem(item, i, "desk-left") : null))}
            </div>
            
            {/* Right Column (Odds: 1, 3) */}
            <div className="flex flex-1 flex-col gap-y-[clamp(24px,4vw,44px)]">
              {lookForData.map((item, i) => (i % 2 !== 0 ? renderItem(item, i, "desk-right") : null))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}