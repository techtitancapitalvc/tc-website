"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";


export interface AboutTheFundPills {
  id: string;
  label: string;
  type: "pill" | "dot"
  rotate: number;
  x: number;
  y: number;
}

export interface AboutTheFundData {
  headingFirst?: string;
  headingSecond?: string;
  paragraphs?: string[];
  pills?: AboutTheFundPills[];
}


const FALLBACK_HEADING_FIRST = "About The";
const FALLBACK_HEADING_SECOND = "Fund";
const FALLBACK_PARAGRAPHS = [
  "We've been with these founders since the beginning, through the early decisions, the difficult pivots, and the milestones that quietly signalled something bigger was being built.",
  "The Winners Fund is our commitment to seeing it through. When a portfolio company demonstrates exceptional momentum and a credible path to category leadership, we return with greater capital and deeper conviction.",
  "Continuity of belief is a form of value in itself, and that is what the Winners Fund represents.",
];

/* ─── Pill data: Fine-tuned X/Y coordinates to eliminate all overlap ─── */
const FALLBACK_PILLS: AboutTheFundPills[] = [
  { id: "vision", label: "Vision", type: "pill", rotate: 0, x: 0, y: 0 },
  
  // Expanded row 2 slightly down and outwards
  { id: "founders", label: "Founders", type: "pill", rotate: 0, x: -4.0, y: 3.0 },
  { id: "scale", label: "Scale", type: "pill", rotate: -10, x: 5.2, y: 3.4 },
  
  // Expanded row 3
  { id: "mentorship", label: "Mentorship", type: "pill", rotate: 8, x: -6.0, y: 6.6 },
  { id: "growth", label: "Growth", type: "pill", rotate: 8, x: 4.4, y: 7.2 },
  
  // Dots pushed out to clear the wider top/bottom elements
  { id: "dot1", label: "", type: "dot", rotate: 0, x: -8.0, y: 10.0 },
  { id: "network", label: "Network", type: "pill", rotate: 0, x: 0, y: 10.2 },
  { id: "dot2", label: "", type: "dot", rotate: 0, x: 8.0, y: 10.0 },
  
  // Partnership & Momentum dropped a bit to clear Network
  { id: "partnership", label: "Partnership", type: "pill", rotate: 0, x: -5.0, y: 13.2 },
  { id: "momentum", label: "Momentum", type: "pill", rotate: 0, x: 5.0, y: 13.2 },
  
  // Bottom row spread wide enough to let Leadership breathe
  { id: "innovation", label: "Innovation", type: "pill", rotate: 12, x: -10.0, y: 16.4 },
  { id: "leadership", label: "Leadership", type: "pill", rotate: 0, x: 0, y: 16.6 },
  { id: "execution", label: "Execution", type: "pill", rotate: -12, x: 10.0, y: 16.4 },
  
  // Success & Bottom Ball pushed down to accommodate the expanded stack
  { id: "success", label: "Success", type: "pill", rotate: 0, x: 0, y: 20.0 },
  { id: "dot3", label: "", type: "dot", rotate: 0, x: 0, y: 24.0 }, 
];

/* ─── Individual Pill Component to handle internal Parallax Physics ─── */
function InteractivePill({
  item,
  idx,
  isInView,
  smoothX,
  smoothY,
}: {
  item: AboutTheFundPills;
  idx: number;
  isInView: boolean;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
}) {
  const delay = 0.2 + idx * 0.08;

  // Items higher up (lower Y) sway more. Items closer to the edges shift vertically more.
  const swayFactorX = (24 - item.y) * 0.06;
  const swayFactorY = item.x * 0.04;

  // Internal parallax disturbance: moves opposite to the cursor
  const parallaxX = useTransform(smoothX, [-1, 1], [`${swayFactorX}em`, `-${swayFactorX}em`]);
  const parallaxY = useTransform(smoothY, [-1, 1], [`${swayFactorY}em`, `-${swayFactorY}em`]);
  const parallaxRot = useTransform(smoothX, [-1, 1], [swayFactorX, -swayFactorX]);

  if (item.type === "dot") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: 0, left: "50%", transformOrigin: "center center", x: parallaxX, y: parallaxY }}
      >
        <motion.div
          className="rounded-full"
          style={{ 
            width: "2.2em", 
            height: "2.2em", 
            transformOrigin: "center center",
            background: "radial-gradient(circle at 35% 35%, #4267B2, #001A4D)",
            boxShadow: "0px 6px 12px rgba(0, 26, 77, 0.2)"
          }}
          initial={{ x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, scale: 0 }}
          animate={
            isInView
              ? { x: `calc(-50% + ${item.x}em)`, y: `${item.y}em`, opacity: 1, scale: 1 }
              : { x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, scale: 0 }
          }
          transition={{ type: "spring", stiffness: 80, damping: 10, mass: 0.9, delay: delay + 0.2 }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      // REMOVED pointer-events-none so the user can interact with the text
      className="absolute"
      style={{ top: 0, left: "50%", transformOrigin: "center center", x: parallaxX, y: parallaxY, rotate: parallaxRot }}
    >
      <motion.div
        // REMOVED select-none so text is selectable
        className="flex items-center justify-center whitespace-nowrap rounded-[62px] border-[0.3px] border-[#001A4D] font-['Poppins',_sans-serif] font-medium italic text-[#001A4D]"
        style={{ 
          padding: "0.8em 2em", 
          fontSize: "1em", 
          transformOrigin: "center center",
          background: "linear-gradient(180deg, #EBF0FF 0%, #D3E2FF 100%)",
          boxShadow: "0px 8px 20px rgba(0, 26, 77, 0.12), inset 0px 2px 4px rgba(255, 255, 255, 0.7)",
          // Ensuring cursor indicates text is selectable
          cursor: "text"
        }}
        initial={{ x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, rotate: item.rotate + (idx % 2 === 0 ? 12 : -12), scale: 0.5 }}
        animate={
          isInView
            ? { x: `calc(-50% + ${item.x}em)`, y: `${item.y}em`, opacity: 1, rotate: item.rotate, scale: 1 }
            : { x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, rotate: item.rotate + (idx % 2 === 0 ? 12 : -12), scale: 0.5 }
        }
        transition={{ type: "spring", stiffness: 80, damping: 10, mass: 0.9 + idx * 0.05, delay }}
      >
        {item.label}
      </motion.div>
    </motion.div>
  );
}

export default function AboutTheFundClient({
  data,
}: {
  data?: AboutTheFundData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const paragraphs = data?.paragraphs?.length ? data.paragraphs : FALLBACK_PARAGRAPHS;
  const pills: AboutTheFundPills[] = data?.pills?.length ? data.pills : FALLBACK_PILLS;

  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.5 });

  /* ─── Physics State ─── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 120, mass: 0.8 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 120, mass: 0.8 });

  const stackTilt = useTransform(smoothX, [-1, 1], [-6, 6]);
  const ballRoll = useTransform(smoothX, [-1, 1], ["3.5em", "-3.5em"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      className="relative flex w-full items-center overflow-hidden"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        ref={sectionRef}
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[clamp(32px,5vw,48px)] md:flex-row md:items-center md:gap-[clamp(24px,3vw,48px)]"
      >
        {/* ── LEFT: Heading + Description ── */}
        <div className="relative z-10 flex w-full flex-col items-center text-center md:w-[45%] md:items-start md:text-left">
          <div className="flex flex-row flex-wrap items-center gap-x-3 max-md:justify-center max-md:gap-x-2">
            <motion.h2
              className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {headingFirst}
            </motion.h2>
            <motion.span
              className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
              initial={{ opacity: 0, x: -80 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <motion.span
                className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 0.7 }}
              />
              <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
                {headingSecond}
              </span>
            </motion.span>
          </div>

          <motion.div
            className="m-0 mt-[clamp(20px,min(2.5vw,3.5vh),40px)] flex flex-col gap-[clamp(12px,1.5vw,20px)] font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-[15px] max-md:!leading-[1.6]"
            style={{ fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)", lineHeight: "167%", maxWidth: "clamp(320px, 42vw, 620px)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          >
            {paragraphs.map((text, i) => (
              <p key={i} className="m-0">{text}</p>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Interactive Balancing Stack ── */}
        <div
          ref={containerRef}
          className="relative flex w-full items-start justify-center md:w-[55%]"
          style={{ height: "27em", fontSize: "clamp(12px, 1.4vw, 22px)" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* THE STACK */}
          <motion.div
            // REMOVED pointer-events-none from the wrapper so child elements receive events
            className="absolute inset-0 h-full w-full"
            style={{ 
              transformOrigin: "center 24em", 
              rotate: stackTilt 
            }}
          >
            {pills.map((item, idx) => {
              if (item.id === "dot3") return null; 
              return <InteractivePill key={item.id} item={item} idx={idx} isInView={isInView} smoothX={smoothX} smoothY={smoothY} />;
            })}
          </motion.div>

          {/* THE BOTTOM BALL */}
          {pills.map((item, idx) => {
            if (item.id !== "dot3") return null;
            const delay = 0.2 + idx * 0.08;

            return (
              <motion.div
                key={item.id}
                className="absolute pointer-events-none"
                style={{ top: 0, left: "50%", transformOrigin: "center center", x: ballRoll }}
              >
                <motion.div
                  className="rounded-full"
                  style={{ 
                    width: "2.2em", 
                    height: "2.2em", 
                    transformOrigin: "center center",
                    background: "radial-gradient(circle at 35% 35%, #4267B2, #001A4D)",
                    boxShadow: "0px 6px 12px rgba(0, 26, 77, 0.2)"
                  }}
                  initial={{ x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, scale: 0 }}
                  animate={
                    isInView
                      ? { x: `calc(-50% + ${item.x}em)`, y: `${item.y}em`, opacity: 1, scale: 1 }
                      : { x: `calc(-50% + ${item.x}em)`, y: -400, opacity: 0, scale: 0 }
                  }
                  transition={{ type: "spring", stiffness: 80, damping: 10, mass: 0.9, delay: delay + 0.2 }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}