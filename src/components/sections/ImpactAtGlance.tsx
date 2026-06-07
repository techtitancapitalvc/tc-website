"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, MotionValue, Variants } from "framer-motion";

/* ── DATA CONFIGURATIONS ── */
const impactData = [
  { num: "300+", label: "Startups Backed", caption: "Across seed, pre-Series A and growth stages since 2011" },
  { num: "650+", label: "Founders Backed", caption: "Operators, builders, and category creators" },
  { num: "₹450B+", label: "Capital Raised by Portfolio", caption: "From 100+ institutional investors globally" },
  { num: "6", label: "Indicorns", caption: "Direct employment across the portfolio ecosystem" },
  { num: "250M+", label: "Lives Impacted", caption: "Customers served by portfolio companies" },
  { num: "4", label: "IPO's", caption: "Direct employment across the portfolio ecosystem" },
];

const slides = [
  {
    name: "Ashish Mahopatra",
    role: "Co-Founder and CEO, OfBusiness",
    image: "/images/misc/5.webp",
    logo: "/images/logos/Ofbusiness.webp",
    text: `"I like businesses that are under the radar. I make products that are far away from the limelight, because that is where a business is to be made."`,
  },
  {
    name: "Abhishek Bansal",
    role: "Co-Founder and CEO, Shadowfax",
    image: "/images/misc/6.webp",
    logo: "/images/logos/Shadowfax.svg",
    text: `"In India, logistics isn't just about speed. It's about reaching the right place even when the address is wrong."`,
  },
  {
    name: "Harshil\nMathur",
    role: "Co-founder and CEO of Razorpay",
    image: "/images/misc/3.webp",
    logo: "/images/logos/Razorpay.webp",
    text: `"We believed in Harshil's mission to simplify payments for every business in India."`,
  },
];

interface CarouselItemProps {
  data: {
    num: string;
    label: string;
    caption: string;
  };
  index: number;
  progress: MotionValue<number>;
}

/* ── SUB-COMPONENT: CAROUSEL ITEM ── */
const CarouselItem = ({ data, index, progress }: CarouselItemProps) => {
  const getDiff = (p: number) => {
    const totalItems = impactData.length;
    const adjustedProgress = Math.min(1, p / 0.5);
    const center = adjustedProgress * totalItems;
    let diff = ((index - center) % totalItems + totalItems) % totalItems;
    if (diff > 3) diff -= totalItems;
    return diff;
  };

  const spread = 0.65;
  const radius = 650;

  const x = useTransform(progress, (p: number) => `${Math.sin(getDiff(p) * spread) * radius}px`);
  const y = useTransform(progress, (p: number) => `${-(getDiff(p) * getDiff(p)) * 20}px`);
  const scale = useTransform(progress, (p: number) => Math.max(0.4, Math.cos(getDiff(p) * 0.8)));
  
  const opacity = useTransform(progress, (p: number) => {
    const diff = Math.abs(getDiff(p));
    if (diff >= 1.5) return 0; 
    return Math.cos(diff * (Math.PI / 3)); 
  });

  const captionOpacity = useTransform(progress, (p: number) => {
    const diff = Math.abs(getDiff(p));
    return diff < 0.3 ? Math.max(0, Math.cos(diff * Math.PI * 1.6)) : 0;
  });

  return (
    <motion.div
      style={{ 
        x, 
        y, 
        scale, 
        opacity, 
        zIndex: useTransform(progress, (p: number) => Math.round(10 - Math.abs(getDiff(p)))) 
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-[90%] max-w-[700px]"
    >
      <h2 className="text-[clamp(28px,3.4vw,44px)] font-bold text-[#001A4D] font-['Libre_Baskerville',_serif] leading-[119%] mb-1 md:mb-2 flex items-center justify-center">
        {data.num}
      </h2>
      <h3 className="text-[clamp(14px,1.75vw,22px)] font-semibold text-[#001A4D] font-['Libre_Baskerville',_serif] leading-[119%] max-w-[180px] md:max-w-[340px] mx-auto">
        {data.label}
      </h3>
      <motion.h4 
        style={{ opacity: captionOpacity }}
        className="mt-4 md:mt-6 text-[#323232] font-['Poppins',_sans-serif] text-[clamp(15px,1.4vw,19px)] font-medium leading-relaxed w-[85%] max-w-2xl mx-auto"
      >
        {data.caption}
      </motion.h4>
    </motion.div>
  );
};

/* ── MAIN UNIFIED STABLE COMPONENT ── */
export default function ImpactAndStories() {
  const masterTrackRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  const { scrollYProgress } = useScroll({
    target: masterTrackRef,
    offset: ["start start", "end end"],
  });

  // Structural translate window curve
  const contentY = useTransform(scrollYProgress, [0.45, 1], ["0px", "-580px"]);

  const blobScale = useTransform(scrollYProgress, (p: number) => {
    if (p > 0.5) return 0;
    const adjusted = p / 0.5;
    const currentPosition = adjusted * impactData.length;
    const dist = Math.abs(currentPosition - Math.round(currentPosition));
    return Math.max(0, Math.cos(dist * Math.PI));
  });
  const blobOpacity = useTransform(blobScale, [0, 1], [0.4, 1.0]);

  const headingY = useTransform(scrollYProgress, [0, 0.20, 0.33, 1], [40, 40, 0, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.20, 0.30, 1], [0, 0, 1, 1]);
  const highlightScaleX = useTransform(scrollYProgress, [0, 0.24, 0.36, 1], [0, 0, 1, 1]);

  const tvGlitch: Variants = {
    initial: { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01 },
    animate: { opacity: 1, filter: "brightness(100%) grayscale(0%)", scaleY: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit:    { opacity: 0, filter: "brightness(0%) grayscale(100%)", scaleY: 0.01, transition: { duration: 0.15, ease: "easeIn" } },
  };

  return (
    <div ref={masterTrackRef} className="relative w-full bg-white" style={{ height: "280vh" }}>
      
      {/* VIEWPORT CANVAS LOCKDOWN */}
      <div 
        className="sticky top-[80px] flex flex-col items-center w-full bg-white overflow-hidden select-none"
        style={{ height: "calc(100svh - 80px)" }}
      >
        <motion.div style={{ y: contentY }} className="w-full flex-shrink-0 flex flex-col items-center">
          
          {/* =========================================================
                STAGE 1: ROTATING CAROUSEL GLOBE
                ========================================================= */}
          <div 
            className="relative w-full h-[450px] overflow-hidden bg-white flex flex-col items-center justify-start"
            style={{ paddingTop: "clamp(80px, min(8vw, 12vh), 120px)" }}
          >
            <div className="relative flex flex-col items-center justify-center w-full px-4 z-10 shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-center text-center gap-2 md:gap-0 w-full max-w-[1280px] mx-auto">
                <span className="relative overflow-hidden inline-block md:mr-4 p-[6px_16px] text-[length:var(--heading-xl)] text-[#001A4D] font-['Libre_Baskerville',_serif] font-bold italic bg-transparent">
                  <span className="absolute inset-0 bg-[#D3E2FF] z-0" />
                  <span className="relative z-10 leading-[120%]">Impact</span>
                </span>
                <span className="text-[length:var(--heading-xl)] text-[#001A4D] font-['Libre_Baskerville',_serif] font-bold not-italic leading-[120%]">
                  at glance
                </span>
              </div>
            </div>

            <div className="relative w-full flex-1 flex items-center justify-center">
              <motion.div
                style={{ scale: blobScale, opacity: blobOpacity }}
                className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] md:w-[200px] md:h-[200px] bg-[#D3E2FF] blur-[40px] md:blur-[50px] rounded-full pointer-events-none z-0"
              />
              {impactData.map((item, i) => (
                <CarouselItem key={i} data={item} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>

          {/* =========================================================
                STAGE 2: FEATURED FOUNDER CREDENTIAL SHOWCASE
                ========================================================= */}
          <div 
            className="w-full bg-white flex flex-col items-center justify-start"
            style={{
              paddingTop:    "clamp(40px, min(6.94vw, 10.18vh), 100px)",
              paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
              paddingLeft:   "var(--section-px-wide)",
              paddingRight:  "var(--section-px-wide)",
            }}
          >
            <div className="mx-auto flex w-full max-w-[828px] flex-col items-center justify-center text-center">
              <motion.h2
                style={{ y: headingY, opacity: headingOpacity }}
                className="m-0 text-center font-['Libre_Baskerville',_serif] font-bold italic leading-[1.2] text-[#001A4D] text-[length:var(--heading-xl)]"
              >
                <span className="relative inline-block overflow-hidden px-2.5">
                  <motion.span 
                    style={{ scaleX: highlightScaleX, transformOrigin: "left" }}
                    className="absolute inset-0 z-0 bg-[#D3E2FF]" 
                  />
                  <span className="relative z-10">Their stories,</span>
                </span>
              </motion.h2>

              <motion.h2
                style={{ y: headingY, opacity: headingOpacity }}
                className="m-0 mt-1 text-center font-['Libre_Baskerville',_serif] font-semibold leading-[1.2] text-[#001A4D] text-[length:var(--heading-xl)]"
              >
                our credentials
              </motion.h2>
            </div>

            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-[clamp(28px,min(4.8vw,7vh),68px)] lg:flex-row lg:items-center lg:justify-center mt-[clamp(24px,min(3.5vw,5vh),48px)]">
              
              <div className="relative w-full shrink-0 overflow-hidden" style={{ maxWidth: "clamp(340px, min(55vw, 75vh), 850px)" }}>
                <div className="absolute left-[8%] top-[13%] z-[5] h-[72%] w-[58%]">
                  <AnimatePresence mode="wait">
                    <motion.div key={`photo-${currentSlide}`} variants={tvGlitch} initial="initial" animate="animate" exit="exit" className="relative h-full w-full">
                      <div className="absolute" style={{ top: "0%", bottom: "8%", right: "-50%", width: "140%" }}>
                        <Image src={slide.image} alt={slide.name} fill sizes="(max-width: 1440px) 45vw, 600px" style={{ objectFit: "cover", objectPosition: "bottom right" }} />
                      </div>
                      <div className="absolute" style={{ bottom: "20%", left: "12%" }}>
                        {/* REDUCED LOGO SIZE by 10% (144x50 down from 160x56) */}
                        <Image src={slide.logo} alt="Logo" width={120} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <Image src="/images/misc/television.svg" alt="TV Frame Frame" width={800} height={500} className="pointer-events-none relative z-[10] block h-auto w-full" priority />

                <div className="absolute left-[8%] top-[13%] z-[15] flex h-[72%] w-[58%] items-start overflow-hidden pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.div key={`text-${currentSlide}`} variants={tvGlitch} initial="initial" animate="animate" exit="exit" className="relative h-full w-full">
                      <h3 className="absolute m-0 font-['Libre_Baskerville',_serif] text-black font-bold" style={{ top: "15%", left: "12%", width: "40%", fontSize: "clamp(11px, 1.8vw, 22px)", lineHeight: "100%" }}>
                        {slide.name}
                      </h3>
                      {/* INCREASED TOP POSITION from 44% to 49% to widen the gap below the name */}
                      <p className="absolute m-0 font-['Poppins',_sans-serif] text-black font-light" style={{ top: "35%", left: "12%", width: "45%", fontSize: "clamp(11px, 1vw, 16px)", lineHeight: "119%" }}>
                        {slide.role}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex w-full flex-col items-center text-center" style={{ maxWidth: "clamp(280px, min(33vw, 48.4vh), 475px)", gap: "clamp(20px, min(2.6vw, 3.81vh), 36px)" }}>
                <AnimatePresence mode="wait">
                  <motion.p key={currentSlide} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="m-0 w-full text-center font-['Poppins',sans-serif] font-normal leading-[1.5] text-black" style={{ fontSize: "clamp(14px, min(1.6vw, 2.35vh), 20px)" }}>
                    {slide.text}
                  </motion.p>
                </AnimatePresence>

                <button 
                  className="group relative flex shrink-0 cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[9px] border-none bg-[#001A4D] font-['Libre_Baskerville',_serif] font-semibold text-white transition-all duration-300 ease-in-out h-[clamp(38px,3.75vw,54px)] w-[clamp(130px,12.6vw,181px)] text-[clamp(11px,1vw,15px)] p-[10px]"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" style={{ background: 'radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), #003CB3 0%, transparent 100%)' }} />
                  <span className="relative z-10 text-center">Read Full Story</span>
                </button>
              </div>

            </div>

            <div className="flex items-center gap-3 mt-[clamp(24px,min(3.5vw,5vh),48px)]">
              {slides.map((_, i) => (
                <button key={i} className={`cursor-pointer border-none p-0 transition-all duration-300 ease-in-out ${currentSlide === i ? "h-[12px] w-8 rounded-[10px] bg-[#001A4D]" : "h-[12px] w-[12px] rounded-full bg-[#D3E2FF]"}`} onClick={() => setCurrentSlide(i)} />
              ))}
            </div>

          </div>

        </motion.div>
      </div>
    </div>
  );
}