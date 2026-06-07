"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const beliefs = [
  {
    title: "Founder-First, Always",
    description:
      "We back people before we back markets. Great founders always figure it out, and we help them do that.",
  },
  {
    title: "Conviction Over Consensus",
    description:
      "The best companies look obvious only in hindsight. We make decisions on first principles, not on what is already crowded or consensus-driven.",
  },
  {
    title: "Built for Endurance",
    description:
      "We are not chasing the next round. We are building partnerships that compound over a decade, through every market, every cycle.",
  },
];

export default function WhatWeBelieve() {
  
  // Slow, elegant fan-out for the cards
  const getCardVariants = (index: number): Variants => {
    if (index === 0) {
      return {
        hidden: { opacity: 0, x: "105%", zIndex: 0 },
        visible: { 
          opacity: 1, 
          x: 0, 
          zIndex: 1, 
          transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 } 
        },
      };
    }
    if (index === 2) {
      return {
        hidden: { opacity: 0, x: "-105%", zIndex: 0 },
        visible: { 
          opacity: 1, 
          x: 0, 
          zIndex: 1, 
          transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 } 
        },
      };
    }
    return {
      hidden: { opacity: 0, y: 40, zIndex: 10 },
      visible: { 
        opacity: 1, 
        y: 0, 
        zIndex: 10, 
        transition: { duration: 0.8, ease: "easeOut", delay: 0 } 
      },
    };
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut", delay: 1.5 } 
    },
  };

  return (
    <section
      className="relative m-0 flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-[#FBF7F0] xl:h-[763px] xl:min-h-max gap-[30px] xl:gap-[48px]"
      style={{ paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)", paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)", paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)" }}
    >
      
     {/* =========================================
          STRICT 1-2-3 ANIMATED HEADING
          ========================================= */}
      <motion.div 
        className="z-20 flex flex-row items-center justify-center text-center w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        {/* PLAIN TEXT: "What" - Using mr-2/mr-3 as the spacebar gap, and leading-none to lock the baseline */}
        <motion.span 
          className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] font-semibold not-italic leading-none text-[#001A4D] mr-2 md:mr-3" 
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
        >
          What
        </motion.span>
        
        {/* HIGHLIGHT: "We believe" - Using inline-flex and exact px/py padding for thick, aligned highlight */}
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
              visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.9 } }
            }}
          />
          
          <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] font-semibold italic leading-none text-[#001A4D]">
            We believe
          </span>
        </motion.span>
      </motion.div>

      {/* =========================================
          ANIMATED CARDS FAN-OUT SEQUENCE
          ========================================= */}
      <motion.div 
        className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col items-center justify-center gap-[24px] lg:flex-row"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {beliefs.map((belief, i) => (
          <motion.div 
            className="relative flex aspect-[16/23] w-full max-w-[320px] shrink-0 flex-col items-center justify-center" 
            key={i}
            variants={getCardVariants(i)}
          >
            <Image
              src="/images/misc/borderedcard.png"
              alt="Card Border"
              fill
              className="pointer-events-none object-contain"
              sizes="(max-width: 768px) 100vw, 323px"
              priority
            />
            
            <motion.div 
              className="absolute left-[12.05%] top-[25.55%] z-10 flex w-[77.95%] flex-col items-start gap-[5.3%] text-left px-[6%]"
              variants={textVariants}
            >
              {/* FIXED TYPO: Changed 21make px to 21px */}
              <h3 className="m-0 self-stretch shrink-0 font-['Libre_Baskerville',_serif] text-[clamp(15px,2.5vw,21px)] font-semibold not-italic leading-[155%] text-[var(--Primary-Color,#001A4D)] px-[4.1%]">
                {belief.title}
              </h3>
              
              <div className="flex w-full items-center justify-center p-[4.1%]">
                <p className="m-0 flex-1 font-['Poppins',_sans-serif] text-[clamp(12px,1.2vw,14px)] font-normal leading-[140%] text-[#323232]">
                  {belief.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}