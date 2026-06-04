"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

const slides = [
  {
    name: "Ashish Mahopatra", 
    role: "Co-Founder and CEO, OfBusiness",
    image: "/images/misc/5.webp",
    logo: "/images/logos/Ofbusiness.webp",
    text: `"We left our careers, put everything into a baby care brand nobody asked for, and built it into India's first D2C IPO"`,
  },
  {
    name: "Abhishek Bansal", 
    role: "Co-Founder and CEO, Shadowfax", 
    image: "/images/misc/6.webp" ,
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

export default function FeaturedFounderStory() {
  const [current, setCurrent] = useState(0);

  // Auto-play interval: Changes slide every 5000ms (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  // The Blackout TV Channel Animation
  const tvGlitchVariants: Variants = {
    initial: {
      opacity: 0,
      filter: "brightness(0%) grayscale(100%)",
      scaleY: 0.01,
    },
    animate: {
      opacity: 1,
      filter: "brightness(100%) grayscale(0%)",
      scaleY: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      }
    },
    exit: {
      opacity: 0,
      filter: "brightness(0%) grayscale(100%)",
      scaleY: 0.01, 
      transition: {
        duration: 0.15,
        ease: "easeIn",
      }
    }
  };

  const text1Variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const highlightVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: { duration: 0.5, ease: "easeInOut", delay: 0.6 }
    }
  };

  const text2Variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: 1.1 }
    }
  };

  return (
    <section className="flex w-full flex-col items-center justify-start gap-6 bg-white px-5 py-6">
      {/* Reduced py and gap to condense the vertical height */}
      
      {/* 1. Heading */}
      <motion.div 
        className="mx-auto flex w-full max-w-[828px] flex-col items-center justify-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 
          className="m-0 text-center font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-bold italic leading-[1.2] text-[#001A4D]" 
          variants={text1Variants}
        >
          <span 
            className="relative inline-block overflow-hidden px-2.5 py-0" 
            style={{ background: "transparent" }} 
          >
            <motion.span
              className="absolute inset-0 z-0 bg-[#D3E2FF]" 
              style={{ transformOrigin: "left" }}
              variants={highlightVariants}
            />
            <span className="relative z-10">Their stories,</span>
          </span>
        </motion.h2>

        <motion.h2 
          className="m-0 mt-1 text-center font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-semibold leading-[1.2] text-[#001A4D]" 
          variants={text2Variants}
        >
          our credentials
        </motion.h2>
      </motion.div>

      {/* 2. TV Wrapper - slightly scaled down max-width to save vertical space */}
      <div className="relative w-full max-w-[650px]">
        <Image
          src="/images/misc/television.png"
          alt="Television frame"
          width={800}
          height={500}
          className="pointer-events-none relative z-0 block h-auto w-full"
          sizes="(max-width: 1317px) 100vw, 1317px"
          priority 
        />
        
        <div className="absolute left-[8%] top-[13%] z-10 flex h-[72%] w-[58%] items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current} 
              variants={tvGlitchVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative h-full w-full"
            >
              <div className="absolute left-[10px] top-1/2 z-20 flex w-[60%] -translate-y-1/2 flex-col gap-2 md:left-5 md:w-1/2 md:gap-3">
                <h3 className="m-0 whitespace-pre-wrap font-['Libre_Baskerville',_serif] text-[clamp(18px,3vw,32px)] font-semibold leading-[1.1] text-black">
                  {slide.name}
                </h3>
                <p className="m-0 font-sans text-[clamp(12px,1.5vw,14px)] font-normal leading-[1.4] text-[#333]">
                  {slide.role}
                </p>
                <div className="mt-1 md:mt-[clamp(10px,2vw,24px)]">
                  <Image 
                    src={slide.logo} 
                    alt="Company logo" 
                    width={160} 
                    height={48} 
                    style={{ 
                      objectFit: "contain", 
                      objectPosition: "left", 
                      width: "140px",  
                      height: "40px"   
                    }} 
                  />
                </div>
              </div>

              <div className="absolute bottom-0 right-[-50px] z-10 h-[160%] w-full md:bottom-[-10px] md:right-[-170px] md:h-[215%] md:w-[145%]">
                <Image
                  src={slide.image}
                  alt={slide.name.replace('\n', ' ')}
                  fill
                  sizes="100vw, 50vw" 
                  style={{ 
                    objectFit: "contain", 
                    objectPosition: "bottom right" 
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Quote Text */}
      <AnimatePresence mode="wait">
        <motion.p 
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="m-0 mx-auto w-full max-w-[640px] text-center font-['Poppins',sans-serif] text-[16px] font-normal leading-[1.5] text-black md:text-[20px]"
        >
          {slide.text}
        </motion.p>
      </AnimatePresence>

      {/* 4. CTA Button - Reduced height to 60px to save space */}
      <button className="flex h-[60px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-lg border-none bg-[#001A4D] font-['Libre_Baskerville',_serif] text-[22px] font-semibold text-white transition-opacity hover:opacity-90">
        Read full story
      </button>

      {/* 5. Pagination Dots */}
      <div className="flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`cursor-pointer border-none p-0 transition-all duration-300 ease-in-out ${
              current === i 
                ? "h-[12px] w-8 rounded-[10px] bg-[#001A4D]" 
                : "h-[12px] w-[12px] rounded-full bg-[#D3E2FF]"
            }`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}