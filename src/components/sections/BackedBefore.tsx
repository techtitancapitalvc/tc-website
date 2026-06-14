"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// ROW 1: 10 Companies
const row1Companies = [
  { name: "Ola", logos_backuprc: "/images/logos_backup/ola.svg", scaleClass: "scale-[0.7]" },
  { name: "Urban Company", logos_backuprc: "/images/logos_backup/Urban Company.webp", scaleClass: "" }, 
  { name: "Mamaearth", logos_backuprc: "/images/logos_backup/mamaearthpng.webp", scaleClass: "scale-[1.3]" },
  { name: "Shadowfax", logos_backuprc: "/images/logos_backup/Shadowfax.svg", scaleClass: "scale-[1.2]" },
  { name: "Razorpay", logos_backuprc: "/images/logos_backup/Razorpay.webp", scaleClass: "scale-[1.3]" },
  { name: "Ofbusiness", logos_backuprc: "/images/logos_backup/Ofbusiness.webp", scaleClass: "scale-[1.6]" },
  { name: "Cart.com", logos_backuprc: "/images/logos_backup/Cart.com.webp", scaleClass: "scale-[1.3]" },
  { name: "Unicommerce", logos_backuprc: "/images/logos_backup/unicommerce-logo.svg", scaleClass: "" },
  { name: "Snapdeal", logos_backuprc: "/images/logos_backup/snapdeal-company-1.webp", scaleClass: "scale-[1.3]" },
  { name: "Credgenics", logos_backuprc: "/images/logos_backup/Credgenics.svg", scaleClass: "scale-[1.3]" }, 
];

// ROW 2: 13 Companies
const row2Companies = [
  { name: "Giva", logos_backuprc: "/images/logos_backup/GIVA.webp", scaleClass: "scale-[0.8]" },
  { name: "Boba Bhai", logos_backuprc: "/images/logos_backup/bobabhai.webp", scaleClass: "" },
  { name: "Invideo", logos_backuprc: "/images/logos_backup/invideo.svg", scaleClass: "scale-[0.8]" },
  { name: "Park+", logos_backuprc: "/images/portfolio_grid/PARK+logo.png", scaleClass: "scale-[1.1]" },
  { name: "Renee", logos_backuprc: "/images/logos_backup/RENEE.svg", scaleClass: "scale-[0.7]" }, 
  { name: "Supertails", logos_backuprc: "/images/portfolio_grid/supertails_black.png", scaleClass: "scale-[1.3]" }, 
  { name: "Zingbus", logos_backuprc: "/images/logos_backup/zingbus.webp", scaleClass: "" },
  { name: "Anveshan", logos_backuprc: "/images/logos_backup/anveshan.webp", scaleClass: "" },
  { name: "Kutumb", logos_backuprc: "/images/logos_backup/Kutumb.webp", scaleClass: "scale-[1.3]" },
  { name: "Magma", logos_backuprc: "/images/logos_backup/magma factory.webp", scaleClass: "scale-[2.4]" },
  { name: "Mekr", logos_backuprc: "/images/logos_backup/mekr.webp", scaleClass: "" },
  { name: "Slovic", logos_backuprc: "/images/logos_backup/slovic.avif", scaleClass: "scale-[1.3]" },
  { name: "Zouk", logos_backuprc: "/images/logos_backup/zouk_new_logo.webp", scaleClass: "scale-[0.8]" },
];

export default function BackedBefore() {
  const loopPoolRow1 = [...row1Companies, ...row1Companies, ...row1Companies];
  const loopPoolRow2 = [...row2Companies, ...row2Companies, ...row2Companies];

  return (
    <section className="flex flex-col items-center gap-[30px] md:gap-[45px] self-stretch overflow-hidden w-full bg-white" style={{ paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)", paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)", paddingLeft: "var(--section-px-wide)", paddingRight: "var(--section-px-wide)" }}>
      
      {/* =========================================
          ANIMATED SCROLL HEADING SEQUENCE
          ========================================= */}
      <div className="flex flex-col items-center w-full max-w-[1009px] px-4 mb-4 md:mb-8 mx-auto">
        
        <motion.h2 
          // FIXED: Enforced clamp(28px) and leading-[100%] on mobile
          className="text-[var(--Primary-Color,#001A4D)] text-center font-['Libre_Baskerville',_serif] text-[clamp(28px,5vw,var(--heading-xl))] italic font-semibold leading-[100%] md:leading-[120%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
        >
          <motion.div 
            className="relative z-10 flex w-full max-w-[fit-content] p-[10px] justify-center items-center gap-[10px] mx-auto bg-transparent"
            variants={{
              hidden: { opacity: 0, x: -80 },
              visible: { 
                opacity: 1, 
                x: 0, 
                transition: { duration: 0.9, ease: "easeOut" } 
              }
            }}
          >
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
            <span className="relative z-20 whitespace-nowrap">Backed Before</span>
          </motion.div>
        </motion.h2>

        <motion.h2 
          // FIXED: Enforced clamp(28px), leading-[100%] on mobile, and changed to not-italic to match screenshot
          className="self-stretch text-[var(--Primary-Color,#001A4D)] text-center font-['Libre_Baskerville',_serif] text-[clamp(28px,5vw,var(--heading-xl))] not-italic font-semibold leading-[100%] md:leading-[120%] mt-2 md:mt-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.7 }}
        >
          Anyone Else Did
        </motion.h2>
      </div>

      {/* =========================================
          TRACK ONE: Left to Right
          ========================================= */}
      <div className="group flex w-full overflow-hidden relative py-4 md:py-6 mt-6" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="flex w-max gap-[36px] md:gap-[54px] pr-[36px] md:pr-[54px] items-center animate-[marquee-right_30s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loopPoolRow1.map((company, i) => (
            <motion.div
              key={`row1-${company.name}-${i}`}
              className="relative flex shrink-0 items-center justify-center h-[36px] w-[108px] md:h-[53px] md:w-[164px] select-none cursor-pointer"
              whileHover={{ scale: 1.15, filter: "brightness(1.08)" }}
              whileTap={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <div className={`relative w-full h-full ${company.scaleClass}`}>
                <Image
                  src={company.logos_backuprc}
                  alt={company.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 108px, 164px"
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
      <div className="group flex w-full overflow-hidden relative py-4 md:py-6 mt-0 md:-mt-4" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="flex w-max gap-[36px] md:gap-[54px] pr-[36px] md:pr-[54px] items-center animate-[marquee-left_35s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loopPoolRow2.map((company, i) => (
            <motion.div
              key={`row2-${company.name}-${i}`}
              className="relative flex shrink-0 items-center justify-center h-[36px] w-[108px] md:h-[53px] md:w-[164px] select-none cursor-pointer"
              whileHover={{ scale: 1.15, filter: "brightness(1.08)" }}
              whileTap={{ scale: 1.25 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <div className={`relative w-full h-full ${company.scaleClass}`}>
                <Image
                  src={company.logos_backuprc}
                  alt={company.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 108px, 164px"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}