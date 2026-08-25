"use client";

import { motion } from "framer-motion";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  LABEL_STYLE,
  CAPTION_STYLE,
} from "@/styles/heroTypography";

/**
 * The stats band, shared by /foundersstory/[slug] and /blogs/[slug].
 *
 * ONE component rather than a copy in each, so "the same stats section as the
 * founder story page" stays true as either page changes. The only thing that
 * differs between them is the ground it sits on, which is what `tone` is for —
 * navy on the founder story, white in the blog layout.
 */

export interface Stat {
  num?: string;
  label?: string;
}

const DIGIT_WINDOW = "1.2em";

/**
 * The suitcase-lock roll: a column of twenty digits per place, clipped to a
 * 1.2em window and slid up so the target digit lands in it. Same mechanic and
 * same timing as PortfolioStats.
 *
 * THE PARSER IS DIFFERENT from PortfolioStats', and it has to be. That one
 * splits a value with `^([^0-9]*)([0-9]+)([^0-9]*)$` — one leading run, one
 * digit run, one trailing run — which cannot describe a THOUSANDS SEPARATOR.
 * Given "2,023" the regex fails, the whole string is treated as digits, and
 * `parseInt(",")` returns NaN, so that column renders `translateY(-NaN%)` and
 * never moves.
 *
 * This tokenises instead: any run of digits rolls, anything else draws as
 * static text at the same height. Covers "2,023", "101X", "$4B+" and
 * "₹151K Cr" with no special cases.
 */
export function RollingNumber({ value }: { value: string }) {
  /* Tokenised ONCE, up front, with each digit's position in the whole figure
     baked in. Counting as we render would mean mutating during render — which
     React forbids, and which would give wrong delays under Strict Mode's
     double invocation anyway. */
  const parts = (() => {
    const runs = value.match(/\d+|\D+/g) ?? [value];
    let order = 0;
    return runs.map((text) =>
      /^\d+$/.test(text)
        ? {
            digits: text
              .split("")
              .map((d) => ({ num: parseInt(d, 10), order: order++ })),
          }
        : { text }
    );
  })();

  const totalDigits = parts.reduce((n, p) => n + (p.digits?.length ?? 0), 0);
  // A single digit at the fast duration barely registers, so it rolls slower.
  const rollDuration = totalDigits === 1 ? 2.8 : 1.5;
  const digitStagger = 0.15;
  // Two full sets of 0-9, so every digit gets a complete spin whatever it is.
  const column = Array.from({ length: 20 }, (_, idx) => idx % 10);

  return (
    /* `tabular-nums` is not cosmetic: proportional digits are different widths,
       so a column sliding through 0-9 would jitter horizontally all the way. */
    <span className="inline-flex flex-row items-center justify-center leading-none tabular-nums">
      {parts.map((part, t) =>
        part.text !== undefined ? (
          <span
            key={t}
            className="inline-flex items-center leading-none"
            style={{ height: DIGIT_WINDOW }}
          >
            {part.text}
          </span>
        ) : (
          <span key={t} className="inline-flex flex-row">
            {part.digits!.map(({ num, order }, i) => (
              <span
                key={i}
                className="relative inline-flex flex-col overflow-hidden"
                style={{ height: DIGIT_WINDOW }}
              >
                <motion.span
                  className="flex flex-col"
                  variants={{
                    hidden: { y: "0%" },
                    visible: {
                      y: `-${(10 + num) * 5}%`,
                      transition: {
                        duration: rollDuration,
                        delay: order * digitStagger,
                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                      },
                    },
                  }}
                >
                  {column.map((n, idx) => (
                    <span
                      key={idx}
                      className="flex items-center justify-center leading-none"
                      style={{ height: DIGIT_WINDOW }}
                    >
                      {n}
                    </span>
                  ))}
                </motion.span>
              </span>
            ))}
          </span>
        )
      )}
    </span>
  );
}

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function StatsBand({
  heading,
  stats,
  footnote,
  tone = "navy",
  maxWidth = "1200px",
}: {
  heading?: string;
  stats?: Stat[];
  footnote?: string;
  /** The ground it sits on. Everything else is identical between the two. */
  tone?: "navy" | "light";
  maxWidth?: string;
}) {
  const real = (stats ?? []).filter((s) => s.num);
  // The stats ARE the section — a heading with nothing under it is not one.
  if (real.length === 0) return null;

  const navy = tone === "navy";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: navy ? "#00112E" : "#FFFFFF",
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {navy && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at 10% 40%, rgba(37,84,196,0.40) 0%, transparent 55%), radial-gradient(ellipse at 90% 70%, rgba(37,84,196,0.28) 0%, transparent 55%)",
          }}
        />
      )}

      <motion.div
        className="relative z-10 mx-auto flex w-full flex-col items-center"
        style={{ maxWidth }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {heading && (
          <motion.h2
            variants={RISE}
            className={`m-0 text-center font-semibold ${SECTION_HEADING_CLASS} ${
              navy ? "text-white" : "text-[#0E0E0E]"
            }`}
            style={{
              ...SECTION_HEADING_STYLE,
              marginBottom: "clamp(28px, min(3.4vw, 5vh), 60px)",
            }}
          >
            {heading}
          </motion.h2>
        )}

        {/* A pure stagger container — it does not fade itself, it just spaces
            its children. 0.5s between stats is what lets each roll finish
            before the next starts, so they read as separate counts rather than
            one blur.

            Columns come from the stat COUNT, not a fixed four: the number is
            editor-driven, and three in a four-column grid would sit lopsided. */}
        <motion.div
          className="grid w-full max-md:!grid-cols-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(real.length, 4)}, minmax(0, 1fr))`,
            gap: "clamp(24px, min(3vw, 4.4vh), 56px)",
          }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.5, delayChildren: 0.1 } },
          }}
        >
          {real.map((s, i) => (
            <motion.div
              key={i}
              className="flex min-w-0 flex-col items-center text-center"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <span
                className={`font-semibold ${SUBHEADING_CLASS} ${
                  navy ? "text-white" : "text-[#0E0E0E]"
                }`}
                style={SUBHEADING_STYLE}
              >
                <RollingNumber value={s.num!} />
              </span>
              {s.label && (
                <span
                  className={`whitespace-pre-line font-['Poppins',_sans-serif] font-normal ${
                    navy ? "text-white/75" : "text-[#4a4a4a]"
                  }`}
                  style={{
                    ...LABEL_STYLE,
                    lineHeight: 1.5,
                    marginTop: "clamp(6px, 0.8vw, 12px)",
                  }}
                >
                  {s.label}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {footnote && (
          <motion.p
            variants={RISE}
            className={`m-0 text-center font-['Poppins',_sans-serif] font-normal ${
              navy ? "text-white/55" : "text-[#6b6b6b]"
            }`}
            style={{ ...CAPTION_STYLE, marginTop: "clamp(24px, min(3vw, 4.4vh), 54px)" }}
          >
            {footnote}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
