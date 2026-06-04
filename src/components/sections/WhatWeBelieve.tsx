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
      "We don’t follow the herd. We invest where we see long-term asymmetric potential, often before the market agrees. Our best bets have always looked early and unusual.",
  },
  {
    title: "Built for Endurance",
    description:
      "We don’t just write a cheque and move on. We partner beyond capital, through hiring, pivots, fundraising, and the moments that don’t make it to the press release.",
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
    <section className="relative flex flex-col items-center w-full min-h-[100dvh] xl:min-h-max xl:h-[763px] pt-[80px] xl:pt-[88px] px-4 xl:px-[83px] pb-[60px] xl:pb-[67px] gap-[30px] xl:gap-[48px] bg-[#FBF7F0] overflow-hidden m-0">
      
     {/* =========================================
          STRICT 1-2-3 ANIMATED HEADING
          ========================================= */}
      <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4 text-center z-20">
        
        {/* STEP 1: "What" slides up */}
        <motion.span 
          className="text-[#001A4D] font-libre text-[40px] md:text-[80px] font-semibold leading-[120%]" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut" }} 
        >
          What
        </motion.span>
        
        {/* STEP 2: The Text Container slides in */}
        <motion.span 
          className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-2 md:px-4" 
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          {/* STEP 3: The Blue Highlight sweeps */}
          <motion.span
            className="absolute inset-0 bg-[#D3E2FF] z-0"
            initial={{ scaleX: 0 }} 
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 1.2 }}
            style={{ transformOrigin: "left" }} 
          />
          
          <span className="relative z-10 text-[#001A4D] font-libre text-[40px] md:text-[80px] italic font-semibold leading-[120%]">
            We believe
          </span>
        </motion.span>
      </div>

      {/* =========================================
          ANIMATED CARDS FAN-OUT SEQUENCE
          ========================================= */}
      <motion.div 
        className="relative flex flex-col lg:flex-row items-center justify-center gap-[24px] w-full max-w-[1050px] mx-auto z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {beliefs.map((belief, i) => (
          <motion.div 
            // THE FIX: Strict max-width and aspect ratio locks the HTML container to the image shape.
            className="relative flex flex-col justify-center items-center w-full max-w-[313px] aspect-[16/23] shrink-0" 
            key={i}
            variants={getCardVariants(i)}
          >
            <Image
              src="/images/misc/borderedcard.svg"
              alt="Card Border"
              fill
              className="object-contain pointer-events-none"
              sizes="(max-width: 768px) 100vw, 313px"
              priority
            />
            
            {/* THE INNER CONTAINER:
              absolute inset-0 forces it to map exactly to the 313x450 boundary.
              px-[32px] prevents the text from ever touching the drawn SVG borders.
            */}
            <motion.div 
              className="absolute inset-0 flex flex-col justify-center text-left px-[28px] md:px-[32px] py-[40px] z-10"
              variants={textVariants}
            >
              <h3 className="text-[#001A4D] font-libre text-[20px] md:text-[24px] font-semibold leading-[155%] not-italic m-0">
                {belief.title}
              </h3>
              <p className="text-[#323232] font-poppins text-[12px] md:text-[14px] font-normal leading-[140%] mt-[12px] md:mt-[16px] m-0">
                {belief.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}