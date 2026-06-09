"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutTheFund() {
  return (
    <section
      className="relative flex w-full items-center overflow-hidden bg-white"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[clamp(32px,5vw,60px)] md:flex-row md:items-center md:gap-[clamp(32px,4vw,80px)]"
      >

        {/* ── LEFT: Heading + Description ── */}
        <motion.div
          className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Heading */}
          <div className="flex flex-row flex-wrap items-center gap-x-3 max-md:justify-center max-md:gap-x-2">
            <motion.h2
              className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
              variants={{
                hidden: { opacity: 0, x: -40 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.9, ease: "easeOut" },
                },
              }}
            >
              About the
            </motion.h2>

            <motion.span
              className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
              variants={{
                hidden: { opacity: 0, x: -80 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
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
                    transition: { duration: 0.6, ease: "easeInOut", delay: 0.7 },
                  },
                }}
              />
              <span className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-none text-[#001A4D]">
                fund
              </span>
            </motion.span>
          </div>

          {/* Description */}
          <motion.p
            className="mt-[clamp(20px,min(2.5vw,3.5vh),40px)] font-['Poppins',_sans-serif] font-normal text-[#323232] max-md:!text-[15px] max-md:!leading-[1.6]"
            style={{
              fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
              lineHeight: "167%",
              maxWidth: "clamp(320px, min(42.36vw, 62.12vh), 610px)",
            }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.5 },
              },
            }}
          >
            We invest in Titan portfolio companies that have demonstrated strong
            momentum and growth. Having partnered with founders since day one, we
            continue to support them with capital, strategic guidance, experience,
            and access to our network. This long-term relationship helps us better
            understand their needs and provide the right support to accelerate
            their journey toward lasting success
          </motion.p>
        </motion.div>

        {/* ── RIGHT: Image ── */}
        <motion.div
          className="relative w-full md:w-1/2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div
            className="relative mx-auto w-full"
            style={{
              aspectRatio: "700 / 520",
              maxWidth: "clamp(320px, min(48.61vw, 71.28vh), 700px)",
            }}
          >
            <Image
              src="/images/titanwinnderfund/AboutTheFund.webp"
              alt="About the fund — founders building together"
              fill
              sizes="(max-width: 768px) 90vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
