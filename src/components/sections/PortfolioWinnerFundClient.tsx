"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/* ── Types ── */
interface PortfolioCompany {
  name: string;
  logo: string;
  category: string;
  logoW: string;
  logoH: string;
}

export interface PortfolioWinnerFundData {
  headingFirst?: string;
  headingSecond?: string;
  companies?: PortfolioCompany[];
}

/* ── Fallbacks ── */
const FALLBACK_HEADING_FIRST = "Winners Fund";
const FALLBACK_HEADING_SECOND = "Portfolio Companies";
const FALLBACK_COMPANIES: PortfolioCompany[] = [
  { name: "Anveshan", logo: "/images/logos_backup/anveshan.webp", category: "Pure & natural foods", logoW: "65%", logoH: "18%" },
  { name: "BECO", logo: "/images/logos_backup/BECO.webp", category: "Sustainable home products", logoW: "48%", logoH: "80%" },
  { name: "Boba Bhai", logo: "/images/logos_backup/bobabhai-logo.webp", category: "QSR & cloud kitchens", logoW: "52%", logoH: "18%" },
  { name: "Giva", logo: "/images/logos_backup/GIVA.webp", category: "Jewellery and Fashion Accessories", logoW: "33%", logoH: "33%" },
  { name: "HomeRun", logo: "/images/logos_backup/homerun.png", category: "B2B quick commerce", logoW: "70%", logoH: "40%" },
  { name: "MEKR", logo: "/images/logos_backup/mekr-logo.webp", category: "Appliance Manufacturing", logoW: "45%", logoH: "30%" },
  { name: "Mitigata", logo: "/images/logos_backup/mitigata-logo.webp", category: "Full-stack cyber security", logoW: "54%", logoH: "21%" },
  { name: "Simplismart", logo: "/images/logos_backup/Simplismart.webp", category: "AI infrastructure", logoW: "68%", logoH: "28%" },
  { name: "Supertails", logo: "/images/logos_backup/supertails black.png", category: "Pet products marketplace", logoW: "60%", logoH: "26%" },
  { name: "Zouk", logo: "/images/logos_backup/zouk_new_logo.webp", category: "Vegan leather goods", logoW: "40%", logoH: "15%" },
];

/* ── Card component ── */
function PortfolioCard({ company, index }: { company: PortfolioCompany; index: number }) {
  const [isActive, setIsActive] = useState(false);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.15 + index * 0.08 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
      onTouchCancel={() => setIsActive(false)}
      className="group relative flex cursor-pointer flex-col items-center overflow-hidden bg-white"
      style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)", width: "100%", aspectRatio: "1 / 1" }}
    >
      <p
        className="relative z-10 w-full text-center font-['Poppins',_sans-serif] font-normal text-[#323232] transition-colors duration-300"
        style={{ paddingTop: "clamp(16px, min(2.5vw, 3.5vh), 32px)", fontSize: "clamp(11px, min(1.1vw, 1.6vh), 16px)" }}
      >
        {company.category}
      </p>

      <div className="relative z-10 flex flex-1 w-full items-center justify-center">
        <div
          className={`relative transition-[filter] duration-500 ease-out ${isActive ? "grayscale-0" : "grayscale"}`}
          style={{ width: company.logoW, height: company.logoH }}
        >
          <Image
            src={company.logo}
            alt={company.name}
            fill
            sizes="(max-width: 768px) 40vw, 20vw"
            className="object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function PortfolioWinnerFundClient({
  data,
}: {
  data?: PortfolioWinnerFundData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const companies = data?.companies?.length ? data.companies : FALLBACK_COMPANIES;

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">
        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[8px] md:px-[8px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 } },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[110%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              {headingFirst}
            </span>
          </motion.div>

          <motion.h2
            className="mt-[clamp(4px,0.5vw,8px)] m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
            }}
          >
            {headingSecond}
          </motion.h2>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-2 gap-[clamp(12px,1.5vw,20px)] md:grid-cols-3 lg:grid-cols-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {companies.map((company, i) => (
            <PortfolioCard key={company.name} company={company} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
