"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

/*
  "Backed Early. Built to last" — showcase grid.
  Each card has a background image + company logo overlay at the bottom.
  Images go in /public/images/backed-early/<slug>.webp
  Logos reuse /public/images/logos/<file>
*/

const companies = [
  {
    name: "Shadowfax",
    bgImage: "/images/backed-early/shadowfax.webp",
    logo: "/images/logos/Shadowfax.svg",
    logoWidth: 180,
    logoHeight: 44,
  },
  {
    name: "Credgenics",
    bgImage: "/images/backed-early/credgenics.webp",
    logo: "/images/logos/Credgenics.svg",
    logoWidth: 170,
    logoHeight: 40,
  },
  {
    name: "OLA",
    bgImage: "/images/backed-early/ola.webp",
    logo: "/images/logos/ola.svg",
    logoWidth: 100,
    logoHeight: 40,
  },
  {
    name: "Zouk",
    bgImage: "/images/backed-early/zouk.webp",
    logo: "/images/logos/zouk_new_logo.webp",
    logoWidth: 80,
    logoHeight: 34,
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut",
      delay: 0.15 + i * 0.1,
    },
  }),
};

export default function BackedEarly() {
  return (
    <section
      className="relative flex w-full items-start overflow-hidden bg-[#FBF7F0]"
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
          {/* "Backed Early." */}
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[115%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
          >
            Backed Early.
          </motion.h2>

          {/* "Built to last" — highlighted italic */}
          <motion.div
            className="mt-[clamp(4px,0.5vw,8px)] relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[6px] md:px-[8px] md:py-[8px]"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.6 },
                },
              }}
            />
            <span className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[115%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              Built to last
            </span>
          </motion.div>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-1 gap-[clamp(12px,1.5vw,20px)] sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              custom={i}
              variants={cardVariants}
              className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden transition-shadow duration-300 ease-out hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)]"
              style={{ borderRadius: "clamp(10px, 1.2vw, 16px)" }}
            >
              {/* Background image */}
              <Image
                src={company.bgImage}
                alt={company.name}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient overlay at bottom for logo legibility */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
                style={{ height: "45%", background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
              />

              {/* Logo — bottom-left */}
              <div
                className="absolute bottom-0 left-0 z-[2] flex items-end transition-transform duration-300 ease-out group-hover:translate-y-[-4px]"
                style={{
                  padding: "clamp(14px, min(1.8vw, 2.6vh), 24px)",
                }}
              >
                <div
                  className="relative"
                  style={{
                    width: `clamp(${company.logoWidth * 0.55}px, ${(company.logoWidth / 1440) * 100}vw, ${company.logoWidth}px)`,
                    height: `clamp(${company.logoHeight * 0.55}px, ${(company.logoHeight / 1440) * 100}vw, ${company.logoHeight}px)`,
                  }}
                >
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    sizes="180px"
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
