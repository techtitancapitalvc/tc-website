"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import FounderQuoteCard from "./FounderQuoteCard";
import type { FounderStory } from "./ImpactAtGlanceClient";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
  CAPTION_STYLE,
} from "@/styles/heroTypography";

/**
 * The four sections of /foundersstory/[slug].
 *
 * EVERY ONE RETURNS null WHEN IT HAS NOTHING TO SHOW. That is the contract the
 * page relies on: it renders all four unconditionally and each decides for
 * itself whether it belongs, so a story with no stats simply has no blue band.
 * Emptiness is judged on the field that makes the section meaningful — a
 * heading with no stats under it is not a section, so the stats decide.
 *
 * TYPE SCALE, by level:
 *   headline / section headings   LEVEL 3
 *   act titles, pull quotes, stat figures   LEVEL 4
 *   body, founders line           LEVEL 5
 *   eyebrows, tags, fact values, labels     LEVEL 6
 *   footnote                      LEVEL 7
 */

const NAVY = "#001A4D";
const CREAM = "#FBF7F0";
/** Shared reading column. Wider than the old 1040 so the level-3 headline
 *  sets in three lines rather than five. */
const COLUMN = "1200px";

const RISE = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ═══════════════════════════════════════════════════════════
   Shared types — mirror the founderStoryPage Sanity document.
   ═══════════════════════════════════════════════════════════ */
export interface StoryFacts {
  location?: string;
  sector?: string;
  year?: string;
  siteUrl?: string;
}
export interface StoryAct {
  eyebrow?: string;
  title?: string;
  body?: string[];
  bodyBold?: string;
  quote?: { text?: string; attribution?: string };
}
export interface StoryStat {
  num?: string;
  label?: string;
}
export interface FounderStoryPageData {
  company?: string;
  tags?: string[];
  headline?: string;
  founders?: string;
  heroImage?: string;
  facts?: StoryFacts;
  acts?: StoryAct[];
  todayHeading?: string;
  todayStats?: StoryStat[];
  todayFootnote?: string;
  exploreHeading?: string;
  exploreBrowseLabel?: string;
  exploreBrowseHref?: string;
}

/* ═══════════════════════════════════════════════════════════
   1. HEADER — tags, headline, founders, photo, fact bar
   ═══════════════════════════════════════════════════════════ */
export function FounderStoryHeader({ data }: { data: FounderStoryPageData }) {
  const { tags, headline, founders, company, heroImage, facts } = data;

  // Nothing worth a section without at least a headline or a photo.
  if (!headline && !heroImage) return null;

  const factRows = [
    { label: "Company", value: company },
    { label: "Location", value: facts?.location },
    { label: "Sector", value: facts?.sector },
    { label: "Year", value: facts?.year },
  ].filter((f) => !!f.value);

  const showFactBar = factRows.length > 0 || !!facts?.siteUrl;

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(24px, min(3vw, 4.4vh), 56px))",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <motion.div
        className="mx-auto flex w-full flex-col"
        style={{ maxWidth: COLUMN }}
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {!!tags?.length && (
          <motion.div variants={RISE} className="flex flex-wrap" style={{ gap: "clamp(8px, 0.9vw, 14px)" }}>
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-normal text-[#3d3d3d]"
                style={{ padding: "8px 20px", ...LABEL_STYLE, background: CREAM }}
              >
                {t}
              </span>
            ))}
          </motion.div>
        )}

        {headline && (
          <motion.h1
            variants={RISE}
            className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, marginTop: "clamp(16px, min(1.8vw, 2.6vh), 30px)" }}
          >
            {headline}
          </motion.h1>
        )}

        {founders && (
          <motion.p
            variants={RISE}
            className={`m-0 font-normal text-[#3d3d3d] ${HERO_BODY_CLASS}`}
            style={{ ...HERO_BODY_STYLE, marginTop: "clamp(10px, min(1.1vw, 1.7vh), 18px)" }}
          >
            {founders}
            {company ? ` — ${company}` : ""}
          </motion.p>
        )}

        {heroImage && (
          <motion.div
            variants={RISE}
            className="relative w-full overflow-hidden bg-[#f0f0f0]"
            style={{
              marginTop: "clamp(24px, min(2.8vw, 4vh), 52px)",
              aspectRatio: "2 / 1",
              borderRadius: "2px",
            }}
          >
            <Image
              src={heroImage}
              alt={`${founders || company || "Founders"}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </motion.div>
        )}

        {showFactBar && (
          <motion.div
            variants={RISE}
            /* Deliberately narrower than the photo, as designed — it reads as a
               caption to the image rather than another full-width band. */
            className="mx-auto flex w-full flex-wrap items-center justify-between gap-[clamp(16px,2vw,32px)] max-md:!flex-col max-md:!items-start"
            style={{
              marginTop: "clamp(24px, min(2.8vw, 4vh), 52px)",
              maxWidth: "min(100%, 900px)",
              border: "1px solid #E4E0D8",
              borderRadius: "2px",
              padding: "clamp(18px, min(1.8vw, 2.6vh), 30px) clamp(20px, min(2vw, 3vh), 36px)",
            }}
          >
            <div className="flex flex-wrap" style={{ gap: "clamp(20px, 3vw, 54px)" }}>
              {factRows.map((f) => (
                <div key={f.label} className="flex flex-col" style={{ gap: "6px" }}>
                  <span
                    className="font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
                    style={LABEL_STYLE}
                  >
                    {f.label}
                  </span>
                  <span
                    className="font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
                    style={LABEL_STYLE}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            {facts?.siteUrl && (
              <Link
                href={facts.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-[8px] whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-medium text-white transition-opacity duration-300 hover:opacity-88"
                style={{ padding: "12px 28px", ...LABEL_STYLE, background: NAVY }}
              >
                Visit Site
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. ACTS — repeatable narrative sections
   ═══════════════════════════════════════════════════════════ */
export function FounderStoryActs({ acts }: { acts?: StoryAct[] }) {
  const real = (acts ?? []).filter((a) => a.title || a.body?.length);
  if (real.length === 0) return null;

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        className="mx-auto flex w-full flex-col"
        style={{ maxWidth: COLUMN, gap: "clamp(48px, min(6vw, 9vh), 110px)" }}
      >
        {real.map((act, i) => {
          const paras = (act.body ?? []).filter(Boolean);
          return (
            <motion.article
              key={i}
              className="flex w-full flex-col"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
            >
              {act.eyebrow && (
                <motion.p
                  variants={RISE}
                  className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
                  style={LABEL_STYLE}
                >
                  {act.eyebrow}
                </motion.p>
              )}

              {act.title && (
                <motion.h2
                  variants={RISE}
                  className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
                  style={{ ...SUBHEADING_STYLE, marginTop: "clamp(6px, 0.7vw, 12px)" }}
                >
                  {act.title}
                </motion.h2>
              )}

              {paras.map((para, j) => (
                <motion.p
                  key={j}
                  variants={RISE}
                  className={`m-0 font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
                  style={{
                    ...HERO_BODY_STYLE,
                    lineHeight: 1.75,
                    marginTop: j === 0 ? "clamp(18px, min(2vw, 2.9vh), 34px)" : "clamp(10px, 1.2vw, 18px)",
                  }}
                >
                  {/* Drop cap on the opening letter only. `float` rather than a
                      separate absolutely-positioned span, so the text wraps
                      around it instead of the first line being indented by a
                      hand-guessed amount. */}
                  {j === 0 && para.length > 0 ? (
                    <>
                      <span
                        aria-hidden
                        className="float-left font-semibold text-[#0E0E0E]"
                        style={{
                          fontSize: "2.4em",
                          lineHeight: 0.82,
                          paddingRight: "0.06em",
                          paddingTop: "0.06em",
                        }}
                      >
                        {para[0]}
                      </span>
                      {para.slice(1)}
                    </>
                  ) : (
                    para
                  )}
                  {j === paras.length - 1 && act.bodyBold && (
                    <strong className="font-semibold text-[#0E0E0E]"> {act.bodyBold}</strong>
                  )}
                </motion.p>
              ))}

              {act.quote?.text && (
                <motion.figure
                  variants={RISE}
                  className="m-0 flex flex-col"
                  style={{
                    marginTop: "clamp(28px, min(3vw, 4.4vh), 54px)",
                    background: CREAM,
                    borderLeft: "3px solid #0E0E0E",
                    borderRadius: "0 2px 2px 0",
                    padding: "clamp(22px, min(2.6vw, 3.8vh), 44px)",
                    gap: "clamp(12px, 1.4vw, 22px)",
                  }}
                >
                  <div className="flex" style={{ gap: "clamp(12px, 1.4vw, 20px)" }}>
                    <svg
                      viewBox="0 0 42 33"
                      fill="none"
                      aria-hidden
                      className="shrink-0"
                      style={{ width: "clamp(24px, 2.2vw, 38px)", height: "auto" }}
                    >
                      <path
                        d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z"
                        fill="#0E0E0E"
                      />
                    </svg>
                    <blockquote
                      className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
                      style={{ ...SUBHEADING_STYLE, lineHeight: 1.35 }}
                    >
                      {act.quote.text}
                    </blockquote>
                  </div>
                  {act.quote.attribution && (
                    <figcaption
                      className="font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
                      style={LABEL_STYLE}
                    >
                      {act.quote.attribution}
                    </figcaption>
                  )}
                </motion.figure>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. TODAY — the navy stats band
   ═══════════════════════════════════════════════════════════ */
export function FounderStoryToday({
  heading,
  stats,
  footnote,
}: {
  heading?: string;
  stats?: StoryStat[];
  footnote?: string;
}) {
  const real = (stats ?? []).filter((s) => s.num);
  // The stats ARE the section — a heading alone is not one.
  if (real.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#00112E]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 10% 40%, rgba(37,84,196,0.40) 0%, transparent 55%), radial-gradient(ellipse at 90% 70%, rgba(37,84,196,0.28) 0%, transparent 55%)",
        }}
      />
      <motion.div
        className="relative z-10 mx-auto flex w-full flex-col items-center"
        style={{ maxWidth: COLUMN }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {heading && (
          <motion.h2
            variants={RISE}
            className={`m-0 text-center font-semibold text-white ${SECTION_HEADING_CLASS}`}
            style={{ ...SECTION_HEADING_STYLE, marginBottom: "clamp(28px, min(3.4vw, 5vh), 60px)" }}
          >
            {heading}
          </motion.h2>
        )}

        {/* `auto-fit` rather than a fixed 4 columns: the count is editor-driven,
            and three stats in a four-column grid would sit lopsided. */}
        <motion.div
          variants={RISE}
          className="grid w-full max-md:!grid-cols-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(real.length, 4)}, minmax(0, 1fr))`,
            gap: "clamp(24px, min(3vw, 4.4vh), 56px)",
          }}
        >
          {real.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span
                className={`font-semibold text-white ${SUBHEADING_CLASS}`}
                style={SUBHEADING_STYLE}
              >
                {s.num}
              </span>
              {s.label && (
                <span
                  className="whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-white/75"
                  style={{ ...LABEL_STYLE, lineHeight: 1.5, marginTop: "clamp(6px, 0.8vw, 12px)" }}
                >
                  {s.label}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {footnote && (
          <motion.p
            variants={RISE}
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-white/55"
            style={{ ...CAPTION_STYLE, marginTop: "clamp(24px, min(3vw, 4.4vh), 54px)" }}
          >
            {footnote}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. EXPLORE — three more stories
   ═══════════════════════════════════════════════════════════ */
export function FounderStoryExplore({
  heading,
  browseLabel,
  browseHref,
  stories,
}: {
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
  stories: FounderStory[];
}) {
  if (!heading || stories.length === 0) return null;

  return (
    <section
      className="relative w-full"
      style={{
        background: CREAM,
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        <motion.div
          className="flex w-full flex-wrap items-baseline justify-between"
          style={{ gap: "clamp(8px, 1.2vw, 20px)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.h2
            variants={RISE}
            className={`m-0 text-[#0E0E0E] ${SECTION_HEADING_CLASS}`}
            style={SECTION_HEADING_STYLE}
          >
            {heading}
          </motion.h2>
          {browseLabel && (
            <motion.div variants={RISE}>
              <Link
                href={browseHref || "/foundersstory"}
                className="font-['Poppins',_sans-serif] font-medium text-[#3d3d3d] underline-offset-4 transition-colors duration-300 hover:text-[#0E0E0E] hover:underline"
                style={LABEL_STYLE}
              >
                {browseLabel}
              </Link>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-3 max-md:!grid-cols-1"
          style={{
            marginTop: "clamp(24px, min(3vw, 4.4vh), 52px)",
            gap: "calc(var(--section-px-wide) * 0.4)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {stories.slice(0, 3).map((s, i) => (
            <FounderQuoteCard key={`${s.name}-${i}`} story={s} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
