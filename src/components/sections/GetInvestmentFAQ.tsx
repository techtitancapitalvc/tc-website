"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   FAQ data
   ═══════════════════════════════════════════════════════ */

const faqs = [
  {
    id: "faq-1",
    question: "Do I need a deck to apply?",
    answer:
      "No. A short email or 6-field form is enough to get started. If there's mutual interest, we'll ask for more at the right time.",
  },
  {
    id: "faq-2",
    question: "What stage do you invest at?",
    answer:
      "Pre-seed and seed. We prefer to be your first institutional investor, and we follow on in later rounds through the Winners Fund.",
  },
  {
    id: "faq-3",
    question: "How long does the process take?",
    answer:
      "We move fast. Most founders hear back from us within days, not weeks.",
  },
  {
    id: "faq-5",
    question: "What happens after you invest?",
    answer:
      "You get full access to the Titan network, ecosystem, and team. The first year as a Titan portfolio company is the most important, we work closely with you on hiring, GTM strategy, and setting up your next fundraise.",
  },
];

/* ═══════════════════════════════════════════════════════
   Single FAQ accordion item
   (mirrors FundAccordionItem from FundDetails.tsx)
   ═══════════════════════════════════════════════════════ */

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="w-full overflow-hidden bg-white"
      style={{
        borderRadius: "clamp(8px, 1vw, 12px)",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent text-left"
        style={{
          padding:
            "clamp(16px, min(1.8vw, 2.6vh), 24px) clamp(18px, min(2.2vw, 3.2vh), 32px)",
        }}
      >
        <span
          className="font-['Poppins',_sans-serif] font-medium text-[#1D2939]"
          style={{ fontSize: "clamp(14px, min(1.39vw, 2.04vh), 20px)" }}
        >
          {faq.question}
        </span>

        <motion.span
          className="ml-4 flex shrink-0 items-center justify-center select-none text-[#1D2939]"
          style={{ fontSize: "clamp(20px, min(2vw, 2.8vh), 28px)" }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          +
        </motion.span>
      </button>

      {/* Expandable answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className="font-['Poppins',_sans-serif] font-normal leading-[1.65] text-[#667085]"
              style={{
                fontSize: "clamp(13px, min(1.18vw, 1.74vh), 17px)",
                padding:
                  "0 clamp(18px, min(2.2vw, 3.2vh), 32px) clamp(16px, min(1.8vw, 2.6vh), 24px)",
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main FAQ section
   ═══════════════════════════════════════════════════════ */

export default function GetInvestmentFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

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
          className="mb-[clamp(32px,min(4.5vw,6.5vh),64px)] flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[115%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" as const },
              },
            }}
          >
            You&apos;ve got questions
          </motion.h2>

          <motion.div
            className="relative mt-[clamp(4px,0.5vw,8px)] inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[8px] md:px-[8px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.3 },
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
                  transition: { duration: 0.6, ease: "easeInOut" as const, delay: 0.8 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[115%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              We&apos;ve got answers
            </span>
          </motion.div>
        </motion.div>

        {/* ── FAQ ACCORDIONS ── */}
        <motion.div
          className="flex w-full max-w-[940px] flex-col gap-[clamp(12px,1.5vw,20px)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.3 },
            },
          }}
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" as const },
                },
              }}
            >
              <FAQItem
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => toggle(faq.id)}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
