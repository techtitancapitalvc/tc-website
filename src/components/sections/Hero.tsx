"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useScaleToFit } from "@/hooks/useScaleToFit";

const NAV_HEIGHT = 77; // fixed navbar height reserved above the hero
const DESIGN_WIDTH = 1440; // the canvas everything below is sized against (px)

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

  // Lays the frame out once at DESIGN_WIDTH, then scales it uniformly to fit
  // both the width AND the height of the current screen.
  const { frameRef, scale, ready } = useScaleToFit<HTMLDivElement>({
    designWidth: DESIGN_WIDTH,
    reservedHeight: NAV_HEIGHT,
  });

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
    // STAGE: fixed to one screen, clips anything that overflows while scaling.
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF7F0]"
      style={{ marginTop: NAV_HEIGHT, height: `calc(100vh - ${NAV_HEIGHT}px)` }}
    >
      {/*
        FRAME: laid out ONCE at DESIGN_WIDTH in fixed px, then scaled uniformly.
        Because the children use fixed px (not vw/vh), every element keeps its
        exact 1440-design proportion and the whole block shrinks/expands together
        to fit both the width and height of any screen.
      */}
      <div
        ref={frameRef}
        className="relative flex flex-col items-center"
        style={{
          width: DESIGN_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          opacity: ready ? 1 : 0, // avoid an unscaled flash before first measure
          willChange: "transform",
        }}
      >
        {/* TYPOGRAPHY */}
        <h1 className="relative z-10 mx-auto w-full max-w-[541px] text-center font-['Libre_Baskerville',_serif] text-[48px] font-normal leading-[110%] text-[#000]">
          300+ bets. All on
          <span className="block font-['Libre_Baskerville',_serif] text-[64px] font-semibold italic leading-[120%] text-[#001A4D]">
            Founders
          </span>
        </h1>

        <p className="relative z-10 mx-auto mt-[8.5px] mb-[39px] w-full max-w-[593px] text-center font-['Poppins',_sans-serif] text-[16px] font-normal leading-[150%] text-[#323232]">
          We partner with founders from day one. We invest conviction, not
          just capital, and stay by their side through every stage of the
          journey
        </p>

        {/* BUTTONS */}
        <div className="relative z-20 mb-[42px] flex flex-row items-center justify-center gap-[24px]">
          <Link
            href="/portfolio"
            className="flex h-[54px] w-[185px] shrink-0 items-center justify-center p-[10px] font-['Libre_Baskerville',_serif] text-[16px] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-60"
          >
            View Portfolio
          </Link>

          <Link
            href="/get-investment"
            className="group relative m-0 flex h-[54px] w-[185px] shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[9px] bg-[#001A4D] p-[10px] font-['Libre_Baskerville',_serif] text-[16px] font-semibold leading-[107%] text-[#F5F0E8] transition-all"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,#003CB3_0%,#012469_50%,#001A4D_100%)] opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
            <span className="relative z-10">Get Investment</span>
          </Link>
        </div>

        {/* CARDS ROW — fixed px from the 1440 canvas, scaled by the frame */}
        <div className="relative z-0 -mt-[96px] w-full">
          <div className="mx-auto flex w-full items-end justify-center gap-[17px]">
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
                      className={`flex flex-col items-start bg-white shadow-[0_4px_14.8px_0_rgba(101,101,101,0.25)] rounded-[12px] ${
                        isLarge
                          ? "aspect-[278/386] w-[278px] gap-[10px] p-[14px]"
                          : "aspect-[240/294] w-[240px] gap-[4px] p-[14px_18px]"
                      }`}
                    >
                      <div className={`relative shrink-0 w-full overflow-hidden rounded-[5px] ${
                        isLarge ? "aspect-[251/291]" : "aspect-[211/223]"
                      }`}>
                        <Image
                          src={currentFounder.image}
                          alt={currentFounder.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes={isLarge ? "340px" : "280px"}
                        />
                      </div>

                      <div className="flex w-full flex-col pt-[5px]">
                        <p className={`w-full font-['Libre_Baskerville',_serif] font-bold leading-[119%] text-black ${
                          isLarge ? "text-[20px]" : "text-[16px]"
                        }`}>
                          {currentFounder.name}
                        </p>
                        <p className="mt-[4px] w-full font-['Poppins',_sans-serif] text-[12px] font-light leading-[119%] text-black">
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
      </div>
    </section>
  );
}