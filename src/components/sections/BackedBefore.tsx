"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

// ROW 1: 10 Companies
const row1Companies = [
  { name: "Ola", logoSrc: "/images/logos/ola.svg", scaleClass: "scale-[0.8]" },
  { name: "Urban Company", logoSrc: "/images/logos/Urban Company.webp", scaleClass: "" }, 
  { name: "Mamaearth", logoSrc: "/images/logos/mamaearthpng.webp", scaleClass: "scale-[1.4]" },
  { name: "Shadowfax", logoSrc: "/images/logos/Shadowfax.svg", scaleClass: "scale-[1.2]" },
  { name: "Razorpay", logoSrc: "/images/logos/Razorpay.webp", scaleClass: "scale-[1.4]" },
  { name: "Ofbusiness", logoSrc: "/images/logos/Ofbusiness.webp", scaleClass: "scale-[1.8]" },
  { name: "Cart.com", logoSrc: "/images/logos/Cart.com.webp", scaleClass: "scale-[1.4]" },
  { name: "Unicommerce", logoSrc: "/images/logos/unicommerce-logo.svg", scaleClass: "" },
  { name: "Snapdeal", logoSrc: "/images/logos/snapdeal-company-1.webp", scaleClass: "scale-[1.4]" },
  { name: "Credgenics", logoSrc: "/images/logos/Credgenics.svg", scaleClass: "scale-[1.4]" }, 
];

// ROW 2: 13 Companies
const row2Companies = [
  { name: "Giva", logoSrc: "/images/logos/GIVA.webp", scaleClass: "scale-[0.8]" },
  { name: "Boba Bhai", logoSrc: "/images/logos/bobaBhai.webp", scaleClass: "" },
  { name: "Invideo", logoSrc: "/images/logos/invideo.svg", scaleClass: "" },
  { name: "Park+", logoSrc: "/images/logos/Park+.webp", scaleClass: "scale-[1.4]" },
  { name: "Renee", logoSrc: "/images/logos/RENEE.svg", scaleClass: "" }, 
  { name: "Supertails", logoSrc: "/images/logos/Supertails.png", scaleClass: "scale-[1.4]" }, 
  { name: "Zingbus", logoSrc: "/images/logos/zingbus.webp", scaleClass: "" },
  { name: "Anveshan", logoSrc: "/images/logos/anveshan.webp", scaleClass: "" },
  { name: "Kutumb", logoSrc: "/images/logos/Kutumb.webp", scaleClass: "scale-[1.4]" },
  { name: "Magma", logoSrc: "/images/logos/magma factory.webp", scaleClass: "scale-[2.4]" },
  { name: "Mekr", logoSrc: "/images/logos/mekr.webp", scaleClass: "" },
  { name: "Powerhouse 91", logoSrc: "/images/logos/powerhouse.webp", scaleClass: "scale-[1.4]" },
  { name: "Zouk", logoSrc: "/images/logos/zouk_new_logo.webp", scaleClass: "scale-[0.8]" },
];

export default function BackedBefore() {
  const loopPoolRow1 = [...row1Companies, ...row1Companies, ...row1Companies];
  const loopPoolRow2 = [...row2Companies, ...row2Companies, ...row2Companies];

  return (
    <section className="flex flex-col items-center gap-[30px] md:gap-[45px] self-stretch py-[50px] md:py-[70px] overflow-hidden w-full bg-white">
      
      {/* =========================================
          ANIMATED SCROLL HEADING SEQUENCE
          ========================================= */}
      <div className="flex flex-col items-center w-full max-w-[1009px] px-4 mb-4 md:mb-8 mx-auto">
        
        <motion.h2 
          className="text-[#001A4D] text-center font-libre text-[40px] md:text-[80px] italic font-semibold leading-[120%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          {/* FIX: Parent gets relative and a positive z-index (z-10) to trap the child layers */}
          <motion.div 
            className="relative z-10 flex w-full max-w-[320px] md:max-w-[554px] p-[10px] justify-center items-center gap-[10px] mx-auto bg-transparent"
            variants={{
              hidden: { opacity: 0, x: -80 },
              visible: { 
                opacity: 1, 
                x: 0, 
                transition: { duration: 0.9, ease: "easeOut" } 
              }
            }}
          >
            {/* FIX: Highlight gets z-0 (positive, but behind text) so it never falls behind the white section background */}
            <motion.div
              className="absolute inset-0 bg-[#d3e2ff] z-0"
              style={{ transformOrigin: "left" }} 
              variants={{
                hidden: { scaleX: 0 },
                visible: { 
                  scaleX: 1, 
                  transition: { duration: 0.9, ease: "easeInOut", delay: 0.35 }
                }
              }}
            />
            {/* FIX: Text gets z-20 to stay clearly on top of the blue box */}
            <span className="relative z-20 whitespace-nowrap">Backed before</span>
          </motion.div>
        </motion.h2>

        <motion.h2 
          className="self-stretch text-[#001A4D] text-center font-libre text-[40px] md:text-[80px] font-semibold leading-[120%] mt-2 md:mt-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
        >
          anyone else did
        </motion.h2>
      </div>

      {/* =========================================
          TRACK ONE: Left to Right
          ========================================= */}
      <div className="group flex w-full overflow-hidden relative py-4 md:py-6 mt-6">
        <div className="flex w-max gap-[40px] md:gap-[60px] pr-[40px] md:pr-[60px] items-center animate-[marquee-right_30s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loopPoolRow1.map((company, i) => (
            <motion.div
              key={`row1-${company.name}-${i}`}
              className="relative flex shrink-0 items-center justify-center h-[40px] w-[120px] md:h-[59px] md:w-[182px] select-none cursor-pointer"
              whileHover={{ scale: 1.15, filter: "brightness(1.08)" }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <div className={`relative w-full h-full ${company.scaleClass}`}>
                <Image
                  src={company.logoSrc}
                  alt={company.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 120px, 182px"
                  priority={i < 10}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* =========================================
          TRACK TWO: Right to Left
          ========================================= */}
      <div className="group flex w-full overflow-hidden relative py-4 md:py-6 mt-0 md:-mt-4">
        <div className="flex w-max gap-[40px] md:gap-[60px] pr-[40px] md:pr-[60px] items-center animate-[marquee-left_35s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loopPoolRow2.map((company, i) => (
            <motion.div
              key={`row2-${company.name}-${i}`}
              className="relative flex shrink-0 items-center justify-center h-[40px] w-[120px] md:h-[59px] md:w-[182px] select-none cursor-pointer"
              whileHover={{ scale: 1.15, filter: "brightness(1.08)" }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <div className={`relative w-full h-full ${company.scaleClass}`}>
                <Image
                  src={company.logoSrc}
                  alt={company.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 120px, 182px"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}