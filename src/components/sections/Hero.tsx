"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const founderSlots = [
  { size: "large", pool: [{ name: "Abhiraj Singh Bhal", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/abhiraj_bahl.png" }, { name: "Ashutosh Valani", role: "Co-Founder, RENÉE Cosmetics", image: "/images/hero_founders_images/ashutosh-valani.png" }] },
  { size: "small", pool: [{ name: "Abhishek Bansal", role: "Co-Founder and CEO, Shadowfax", image: "/images/hero_founders_images/abhishek-bansal.png" }, { name: "Ishendra Agarwal", role: "Co-Founder, GIVA", image: "/images/hero_founders_images/ishendra-agarwal.png" }] },
  { size: "small", pool: [{ name: "Ruchi Kalra", role: "Co-Founder & CFO, Ofbusiness", image: "/images/hero_founders_images/ruchi-kalra.png" }, { name: "Anand Agrawal", role: "Co-Founder & CPTO, Credgenics", image: "/images/hero_founders_images/anand-agarwal.png" }] },
  { size: "small", pool: [{ name: "Varun Khaitan", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/varun-khaitan.png" }, { name: "Bhavish Aggarwal", role: "CEO of Ola Cabs", image: "/images/hero_founders_images/bhavish-aggarwal.png" }] },
  { size: "large", pool: [{ name: "Ghazal Alagh", role: "Co-Founder, Mamaearth", image: "/images/hero_founders_images/ghazal-alagh.png" }, { name: "Shashank Kumar", role: "Co-Founder, Razorpay", image: "/images/hero_founders_images/shashank-kumar.png" }] },
];

export default function Hero() {
  const [currentIndices, setCurrentIndices] = useState([0, 0, 0, 0, 0]);
  const [flipState, setFlipState] = useState([false, false, false, false, false]);

  useEffect(() => {
    const triggerStaggeredFlip = async () => {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200)); 
        setFlipState((prev) => { const next = [...prev]; next[i] = !next[i]; return next; });
        setCurrentIndices((prev) => { const next = [...prev]; next[i] = (next[i] + 1) % founderSlots[i].pool.length; return next; });
      }
    };
    const interval = setInterval(triggerStaggeredFlip, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center w-full min-h-[100dvh] pt-[100px] lg:pt-[110px] xl:pt-[160px] pb-[10px] bg-[#FBF7F0] overflow-hidden shrink-0 m-0">
      
      {/* HEADING */}
      <h1 className="relative z-10 w-full max-w-[717px] text-center text-black font-libre text-[40px] md:text-[64px] font-normal leading-[110%] px-4">
        300+ bets. all on
        <span className="block text-[#001A4D] font-libre text-[48px] md:text-[80px] italic font-semibold leading-[120%]">
          Founders
        </span>
      </h1>

      {/* SUBTITLE */}
      <p className="relative z-10 w-full max-w-[593px] text-center text-[#323232] font-poppins text-[14px] md:text-[16px] font-normal not-italic leading-[150%] mt-[16px] lg:mt-[20px] xl:mt-[32px] px-4">
        We partner with founders from day one. We invest conviction, not
        just capital, and stay by their side through every stage of the
        journey
      </p>

      {/* BUTTONS */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-[16px] md:gap-[24px] mt-[24px] lg:mt-[28px] xl:mt-[40px] px-4">
        <Link 
          href="/portfolio" 
          className="flex w-full sm:w-[185px] h-[54px] p-[10px] justify-center items-center gap-[10px] text-[#001A4D] font-libre text-[16px] font-semibold leading-[107%] hover:opacity-60 transition-opacity"
        >
          View Portfolio
        </Link>
        <Link 
          href="/get-investment" 
          className="group relative flex w-full sm:w-[185px] h-[54px] p-[10px] justify-center items-center gap-[10px] rounded-[9px] bg-[#001A4D] text-[#F5F0E8] font-libre text-[16px] font-semibold leading-[107%] shrink-0 m-0 overflow-hidden"
        >
          <div className="absolute inset-0 rounded-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" style={{ background: "radial-gradient(277.5% 75.29% at 20.81% 36.11%, #003CB3 0%, #012469 47.6%, #001A4D 100%)" }} />
          <span className="relative z-10">Get Investment</span>
        </Link>
      </div>

      {/* CAROUSEL */}
      <div className="relative z-0 w-full shrink-0 overflow-x-auto lg:overflow-visible mt-[30px] lg:mt-[-20px] xl:mt-[-10px] scrollbar-hide px-4 lg:px-0">
        <div className="flex items-end justify-center gap-[10px] lg:gap-[14px] xl:gap-[17px] min-w-max lg:min-w-0 mx-auto">
          {founderSlots.map((slot, i) => {
            const currentFounder = slot.pool[currentIndices[i]];
            const isLarge = slot.size === "large";
            
            return (
              <div key={i} className="shrink-0" style={{ perspective: "1200px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndices[i]} 
                    initial={{ rotateY: -90, opacity: 0, scale: 0.95 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: 90, opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className={`flex flex-col items-start rounded-[12px] bg-white shadow-[0_4px_14.8px_0_rgba(101,101,101,0.25)] ${
                      isLarge 
                        ? "w-[160px] h-[222px] lg:w-[200px] lg:h-[280px] xl:w-[278px] xl:h-[386px] p-[10px_10px_40px_10px] lg:p-[12px_12px_50px_12px] xl:p-[14px_14px_81px_13px] gap-[6px] xl:gap-[10px]" 
                        : "w-[138px] h-[169px] lg:w-[172px] lg:h-[212px] xl:w-[240px] xl:h-[294px] p-[8px_10px_8px_10px] lg:p-[10px_12px_10px_12px] xl:p-[12px_15px_11px_14px] gap-[8px] xl:gap-[14px]"
                    }`}
                  >
                    <div className={`relative shrink-0 rounded-[5px] overflow-hidden ${
                      isLarge 
                        ? "w-[140px] h-[162px] lg:w-[176px] lg:h-[208px] xl:w-[251px] xl:h-[291px]" 
                        : "w-[122px] h-[128px] lg:w-[148px] lg:h-[155px] xl:w-[211px] xl:h-[223px]"
                    }`}>
                      <Image
                        src={currentFounder.image}
                        alt={currentFounder.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes={isLarge ? "(max-width: 1280px) 206px, 251px" : "(max-width: 1280px) 176px, 211px"}
                      />
                    </div>

                    <div className="flex flex-col pt-[2px] xl:pt-[5px]">
                      <p className={`text-black font-libre font-bold leading-[119%] ${
                        isLarge ? "text-[12px] lg:text-[16px] xl:text-[20px]" : "text-[10px] lg:text-[12px] xl:text-[16px]"
                      }`}>
                        {currentFounder.name}
                      </p>
                      <p className={`text-black font-poppins font-light leading-[119%] mt-[2px] xl:mt-[4px] ${
                        isLarge ? "text-[8px] lg:text-[10px] xl:text-[12px]" : "text-[8px] lg:text-[10px] xl:text-[12px]"
                      }`}>
                        {currentFounder.role}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}