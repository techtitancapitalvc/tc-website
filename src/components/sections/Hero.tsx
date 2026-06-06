"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/*
  RESPONSIVE STRATEGY — pure fluid CSS, height- AND width-aware.

  Every size is written as clamp(MIN, min(vw-fluid, vh-fluid), MAX):
    - MAX  = the design value (Figma spec). Caps growth on huge monitors.
    - vw-fluid = design_value / 1440 * 100 — scales with viewport width.
    - vh-fluid = design_value / 982  * 100 — scales with viewport height.
    - min(vw, vh) makes the value shrink based on WHICHEVER axis is tighter.
       This is why the hero now fits on wide-but-short screens like Windows
       1920×1080 @ 125% / 150% (effective 1536×864 / 1280×720), where height
       is the binding constraint.
    - MIN = legibility floor; the value never goes below this.
*/

const founderSlots = [
  { size: "large", pool: [{ name: "Abhiraj Singh Bhal", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/abhiraj_bahl.png" }, { name: "Ashutosh Valani", role: "Co-Founder, RENÉE Cosmetics", image: "/images/hero_founders_images/ashutosh-valani.png" }] },
  { size: "small", pool: [{ name: "Abhishek Bansal", role: "Co-Founder and CEO, Shadowfax", image: "/images/hero_founders_images/abhishek-bansal.png" }, { name: "Ishendra Agarwal", role: "Co-Founder, GIVA", image: "/images/hero_founders_images/ishendra-agarwal.png" }] },
  { size: "small", pool: [{ name: "Ruchi Kalra", role: "Co-Founder & CFO, Ofbusiness", image: "/images/hero_founders_images/ruchi-kalra.png" }, { name: "Anand Agrawal", role: "Co-Founder & CPTO, Credgenics", image: "/images/hero_founders_images/anand-agarwal.png" }] },
  { size: "small", pool: [{ name: "Varun Khaitan", role: "Co-Founder, Urban Company", image: "/images/hero_founders_images/varun-khaitan.png" }, { name: "Bhavish Aggarwal", role: "CEO of Ola Cabs", image: "/images/hero_founders_images/bhavish-aggarwal.png" }] },
  { size: "large", pool: [{ name: "Ghazal Alagh", role: "Co-Founder, Mamaearth", image: "/images/hero_founders_images/ghazal-alagh.png" }, { name: "Shashank Kumar", role: "Co-Founder, Razorpay", image: "/images/hero_founders_images/shashank-kumar.png" }] },
];

export default function Hero() {
  const [currentIndices, setCurrentIndices] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const triggerStaggeredFlip = async () => {
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setCurrentIndices((prev) => { const next = [...prev]; next[i] = (next[i] + 1) % founderSlots[i].pool.length; return next; });
      }
    };
    const interval = setInterval(triggerStaggeredFlip, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FBF7F0]"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(20px, 5vh, 64px)",
        paddingBottom: "clamp(20px, 5vh, 64px)",
        paddingLeft: "clamp(16px, 3vw, 48px)",
        paddingRight: "clamp(16px, 3vw, 48px)",
      }}
    >
      <div className="relative flex w-full max-w-[1440px] flex-col items-center">

        {/* HEADING — h1 caps at 48 / 64, shrinks on either narrow OR short screens */}
        <h1 className="relative z-10 mx-auto w-full max-w-[541px] text-center font-['Libre_Baskerville',_serif] font-normal leading-[110%] text-black text-[clamp(28px,min(3.33vw,4.89vh),48px)]">
          300+ bets. All on
          <span className="block font-semibold italic leading-[120%] text-[#001A4D] text-[clamp(36px,min(4.44vw,6.52vh),64px)]">
            Founders
          </span>
        </h1>

        {/* SUBHEAD */}
        <p
          className="relative z-10 mx-auto w-full max-w-[593px] text-center font-['Poppins',_sans-serif] font-normal leading-[150%] text-[#323232] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
          style={{
            marginTop: "clamp(6px, min(0.6vw, 0.92vh), 9px)",
            marginBottom: "clamp(16px, min(2.7vw, 3.97vh), 39px)",
          }}
        >
          We partner with founders from day one. We invest conviction, not
          just capital, and stay by their side through every stage of the
          journey
        </p>

        {/* BUTTONS */}
        <div
          className="relative z-20 flex flex-row items-center justify-center"
          style={{
            gap: "clamp(12px, min(1.66vw, 2.44vh), 24px)",
            marginBottom: "clamp(16px, min(2.9vw, 4.28vh), 42px)",
          }}
        >
          <Link
            href="/portfolio"
            className="flex shrink-0 items-center justify-center p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-60 h-[clamp(40px,min(3.75vw,5.5vh),54px)] w-[clamp(140px,min(12.85vw,18.84vh),185px)] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
          >
            View Portfolio
          </Link>

          <Link
            href="/get-investment"
            className="group relative m-0 flex shrink-0 items-center justify-center gap-[10px] overflow-hidden rounded-[clamp(7px,0.625vw,9px)] bg-[#001A4D] p-[10px] font-['Libre_Baskerville',_serif] font-semibold leading-[107%] text-[#F5F0E8] transition-all h-[clamp(40px,min(3.75vw,5.5vh),54px)] w-[clamp(140px,min(12.85vw,18.84vh),185px)] text-[clamp(13px,min(1.11vw,1.63vh),16px)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,#003CB3_0%,#012469_50%,#001A4D_100%)] opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
            <span className="relative z-10">Get Investment</span>
          </Link>
        </div>

        {/* CARDS ROW — overlap less on short screens (max picks the less-negative value) */}
        <div
          className="relative z-0 w-full"
          style={{ marginTop: "clamp(-72px, max(-6.67vw, -9.78vh), -24px)" }}
        >
          <div
            className="mx-auto flex w-full items-end justify-center"
            style={{ gap: "clamp(6px, min(1.18vw, 1.73vh), 17px)" }}
          >
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
                      className={`flex flex-col items-start bg-white shadow-[0_4px_14.8px_0_rgba(101,101,101,0.25)] rounded-[clamp(8px,0.83vw,12px)] ${
                        isLarge
                          ? "aspect-[278/386] w-[clamp(150px,min(19.3vw,28.31vh),278px)] gap-[clamp(6px,min(0.69vw,1.02vh),10px)] p-[clamp(10px,min(0.97vw,1.43vh),14px)]"
                          : "aspect-[240/294] w-[clamp(130px,min(16.67vw,24.44vh),240px)] gap-[clamp(2px,min(0.27vw,0.41vh),4px)] p-[clamp(10px,min(0.97vw,1.43vh),14px)_clamp(12px,min(1.25vw,1.83vh),18px)]"
                      }`}
                    >
                      <div className={`relative shrink-0 w-full overflow-hidden rounded-[clamp(3px,0.34vw,5px)] ${
                        isLarge ? "aspect-[251/291]" : "aspect-[211/223]"
                      }`}>
                        <Image
                          src={currentFounder.image}
                          alt={currentFounder.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes={isLarge ? "(max-width: 1440px) 19.3vw, 278px" : "(max-width: 1440px) 16.67vw, 240px"}
                        />
                      </div>

                      <div className="flex w-full flex-col" style={{ paddingTop: "clamp(3px, 0.34vw, 5px)" }}>
                        <p className={`w-full font-['Libre_Baskerville',_serif] font-bold leading-[119%] text-black ${
                          isLarge ? "text-[clamp(14px,min(1.38vw,2.04vh),20px)]" : "text-[clamp(12px,min(1.11vw,1.63vh),16px)]"
                        }`}>
                          {currentFounder.name}
                        </p>
                        <p
                          className="w-full font-['Poppins',_sans-serif] font-light leading-[119%] text-black text-[clamp(10px,min(0.83vw,1.22vh),12px)]"
                          style={{ marginTop: "clamp(2px, 0.27vw, 4px)" }}
                        >
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
