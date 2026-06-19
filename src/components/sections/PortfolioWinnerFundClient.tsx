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

/* ── Card component ──
   Default: white card, colored logo centred, nothing else.
   Hover  : navy bg, logo flips to white via `brightness(0) invert(1)`
            and slides to the top, description + READ link fade in below.
   The brightness/invert filter only renders cleanly on logos uploaded
   with transparent backgrounds — logos with solid coloured backgrounds
   (e.g. GIVA's purple square) will read as solid white blocks on navy.
   Re-export those with transparency if you want a cleaner hover. */
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
      className="group relative flex cursor-pointer flex-col overflow-hidden"
      style={{
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
        width: "100%",
        aspectRatio: "1 / 1",
        backgroundColor: isActive ? "#001A4D" : "#FFFFFF",
        transition: "background-color 0.5s ease-out",
      }}
    >
      {/* ── LOGO — fills the card by default; shrinks to top on hover ── */}
      <motion.div
        className="flex w-full shrink-0 items-center justify-center"
        animate={{ height: isActive ? "45%" : "100%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ paddingTop: isActive ? "clamp(14px, 1.8vw, 22px)" : 0 }}
      >
        <div
          className={`relative transition-[filter] duration-500 ease-out ${
            isActive ? "[filter:brightness(0)_invert(1)]" : ""
          }`}
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
      </motion.div>

      {/* ── DESCRIPTION + READ — only on hover ── */}
      <motion.div
        className="flex w-full flex-1 flex-col justify-between text-white"
        style={{ padding: "clamp(12px, 1.8vw, 22px)" }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: isActive ? 0.15 : 0 }}
      >
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal leading-[1.45]"
          style={{ fontSize: "clamp(11px, min(1vw, 1.5vh), 14px)" }}
        >
          {company.category}
        </p>
        <div className="mt-auto flex items-center gap-[6px] pt-2">
          <span
            className="font-['Poppins',_sans-serif] font-medium uppercase tracking-wide"
            style={{ fontSize: "clamp(9px, min(0.85vw, 1.25vh), 12px)" }}
          >
            Read
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </motion.div>
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
