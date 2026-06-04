"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const impactData = [
  { num: "300+", label: "Startups Backed" },
  { num: "650+", label: "Founders Backed" },
  { num: "₹450B", label: "Capital Raised by Portfolio" },
  { num: "6", label: "Indicorns" },
  { num: "250M+", label: "Lives Impacted" },
  { num: "4", label: "IPO's" },
];

const CarouselItem = ({ 
  data, 
  index, 
  progress 
}: { 
  data: typeof impactData[0], 
  index: number, 
  progress: MotionValue<number> 
}) => {
  
  const getDiff = (p: number) => {
    const totalItems = impactData.length;
    const center = p * totalItems;
    let diff = ((index - center) % totalItems + totalItems) % totalItems;
    if (diff > 3) diff -= totalItems;
    return diff;
  };

  const angleMultiplier = 0.6; 
  const radius = 850; 

  const x = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return `${Math.sin(diff * angleMultiplier) * radius}px`;
  });

  // ANIMATION LAYOUT FIX: Changed from plus to minus to curve the items UPWARD on the sides
  const y = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return `${- (diff * diff) * 45}px`; 
  });

  const scale = useTransform(progress, (p) => {
    const diff = getDiff(p);
    return Math.max(0, Math.cos(diff * angleMultiplier)); 
  });

  const opacity = useTransform(progress, (p) => {
    const diff = Math.abs(getDiff(p));
    if (diff >= 2.5) return 0; 
    return Math.max(0, Math.cos(diff * angleMultiplier));
  });

  const zIndex = useTransform(progress, (p) => Math.round(10 - Math.abs(getDiff(p))));

  return (
    <motion.div
      style={{ x, y, scale, opacity, zIndex }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-[90%] max-w-[600px]"
    >
      <span className="text-[64px] md:text-[128px] font-bold text-[#001A4D] font-libre leading-none mb-4 md:mb-6 tracking-tight">
        {data.num}
      </span>
      <span className="text-[24px] md:text-[44px] font-semibold text-[#001A4D] font-libre leading-tight">
        {data.label}
      </span>
    </motion.div>
  );
};

export default function ImpactAtGlance() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section 
      ref={containerRef} 
      className="block relative w-full h-[300vh] p-0 m-0 overflow-visible"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-[40px] md:pt-[80px]">
        
      {/* =========================================
            ANIMATED HEADING SEQUENCE
            ========================================= */}
        <div className="flex flex-col items-center justify-center w-full px-4 mb-auto pt-[40px] md:pt-[70px] z-50">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center text-center gap-2 md:gap-0 w-full max-w-[1280px] mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            
            {/* STEP 1 & 2: "Impact" and its Highlight Box */}
            <motion.span 
              className="relative overflow-hidden inline-block md:mr-4 p-[6px_16px] text-[40px] md:text-[80px] text-[#001A4D] font-libre font-semibold bg-transparent"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              <motion.span
                className="absolute inset-0 bg-[#D3E2FF] z-0" 
                style={{ transformOrigin: "left" }} 
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.5 } }
                }}
              />
              <span className="relative z-10 italic leading-[120%]">Impact</span>
            </motion.span>
            
            {/* STEP 3: "at glance" */}
            <motion.span 
              className="px-4 text-[40px] md:text-[80px] text-[#001A4D] font-libre font-semibold"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.9 } }
              }}
            >
              at glance
            </motion.span>
          </motion.div>
        </div>

        {/* =========================================
            SPHERICAL INFINITE GLOBE CAROUSEL
            ========================================= */}
        <div className="relative w-full flex-1 flex items-center justify-center -mt-10 md:-mt-20">
          
          {/* CENTER GRADIENT BLOB */}
          <div className="absolute inset-0 m-auto w-[240px] h-[240px] md:w-[400px] md:h-[400px] bg-[#D3E2FF] opacity-30 md:opacity-100 blur-[60px] md:blur-[100px] rounded-full pointer-events-none z-0" />

          {/* INFINITE CAROUSEL ITEMS */}
          {impactData.map((item, i) => (
            <CarouselItem 
              key={i} 
              data={item} 
              index={i} 
              progress={scrollYProgress} 
            />
          ))}

          {/* STATIC OVERLAY DESCRIPTION */}
          <motion.p 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[170px] md:translate-y-[270px] text-[#323232] font-poppins text-[10px] md:text-[12px] text-center w-[50%] max-w-2xl leading-relaxed z-50 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, ease: "easeOut" }} 
          >
            Across seed, pre-Series A and growth stages since 2011
          </motion.p>

        </div>
      </div>
    </section>
  );
}