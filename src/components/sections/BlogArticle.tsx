"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import StatsBand, { type Stat } from "./StatsBand";
import {
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
  LABEL_STYLE,
} from "@/styles/heroTypography";

/**
 * /blogs/[slug] — the article.
 *
 * TYPE SCALE, exactly as specified:
 *   title                LEVEL 4  (SUBHEADING)
 *   excerpt              LEVEL 5
 *   meta line            LEVEL 6  — the strip between the two rules
 *   body + subheadings   LEVEL 5, the subheading bold. Same size on purpose:
 *                        the weight is what separates them, so a section reads
 *                        as a continuation of the article rather than a new
 *                        chapter competing with the title above.
 *
 * EVERY PART HIDES ITSELF WHEN EMPTY. Sections, stats and the closing image
 * are all independent, so a post can be a header and three paragraphs and
 * nothing renders around it.
 */

export interface BlogSection {
  subheading?: string;
  body?: string[];
  bodyBold?: string;
}

export interface BlogPostData {
  slug?: string;
  title?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  category?: string;
  sections?: BlogSection[];
  statsHeading?: string;
  stats?: Stat[];
  statsFootnote?: string;
  closingImage?: string;
  closingSections?: BlogSection[];
}

const COLUMN = "1040px";

const RISE = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** One body section: a bold subheading and its paragraphs, all level 5. */
function Section({ section }: { section: BlogSection }) {
  const paras = (section.body ?? []).filter(Boolean);
  if (!section.subheading && paras.length === 0) return null;

  return (
    <motion.div
      className="flex w-full flex-col"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {section.subheading && (
        <motion.h2
          variants={RISE}
          /* Level 5 at 600 — the same SIZE as the body beneath it. */
          className={`m-0 font-semibold text-[#0E0E0E] ${HERO_BODY_CLASS}`}
          style={{ ...HERO_BODY_STYLE, lineHeight: 1.5 }}
        >
          {section.subheading}
        </motion.h2>
      )}

      {paras.map((para, i) => (
        <motion.p
          key={i}
          variants={RISE}
          className={`m-0 whitespace-pre-line font-normal text-[#1a1a1a] ${HERO_BODY_CLASS}`}
          style={{
            ...HERO_BODY_STYLE,
            lineHeight: 1.75,
            marginTop:
              i === 0
                ? section.subheading
                  ? "clamp(14px, min(1.6vw, 2.3vh), 26px)"
                  : 0
                : "clamp(8px, 1vw, 14px)",
          }}
        >
          {para}
          {i === paras.length - 1 && section.bodyBold && (
            <strong className="font-semibold text-[#0E0E0E]"> {section.bodyBold}</strong>
          )}
        </motion.p>
      ))}
    </motion.div>
  );
}

export default function BlogArticle({ post }: { post: BlogPostData }) {
  const sections = (post.sections ?? []).filter(
    (s) => s.subheading || s.body?.length
  );
  const closingSections = (post.closingSections ?? []).filter(
    (s) => s.subheading || s.body?.length
  );
  const metaBits = [post.author, post.readTime, post.category && `Category: ${post.category}`]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <>
      <section
        className="relative w-full bg-white"
        style={{
          paddingTop: "calc(var(--nav-height) + clamp(20px, min(2.4vw, 3.6vh), 44px))",
          paddingBottom: "var(--section-py)",
          paddingLeft: "var(--section-px-wide)",
          paddingRight: "var(--section-px-wide)",
        }}
      >
        <div className="mx-auto flex w-full flex-col" style={{ maxWidth: COLUMN }}>
          {/* ── Back / breadcrumb ── */}
          <div className="flex w-full flex-row items-center justify-between">
            <Link
              href="/blogs"
              className="font-['Poppins',_sans-serif] font-light text-black transition-opacity duration-200 hover:opacity-70"
              style={LABEL_STYLE}
            >
              Back
            </Link>
            <p className="m-0 font-['Poppins',_sans-serif] text-black" style={LABEL_STYLE}>
              <Link href="/blogs" className="font-light transition-opacity duration-200 hover:opacity-70">
                Blogs
              </Link>
              <span className="font-light"> / </span>
              <span className="font-medium">{post.category || post.title}</span>
            </p>
          </div>

          {post.coverImage && (
            <motion.div
              className="relative w-full overflow-hidden bg-[#f0f0f0]"
              style={{
                marginTop: "clamp(24px, min(2.6vw, 3.8vh), 48px)",
                aspectRatio: "16 / 9",
                borderRadius: "2px",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={post.coverImage}
                alt={post.title || ""}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1040px"
                className="object-cover object-center"
              />
            </motion.div>
          )}

          {post.title && (
            <motion.h1
              className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                lineHeight: 1.28,
                marginTop: "clamp(20px, min(2.2vw, 3.2vh), 40px)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              {post.title}
            </motion.h1>
          )}

          {post.excerpt && (
            <motion.p
              className={`m-0 font-normal text-[#3d3d3d] ${HERO_BODY_CLASS}`}
              style={{ ...HERO_BODY_STYLE, marginTop: "clamp(14px, min(1.6vw, 2.3vh), 26px)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              {post.excerpt}
            </motion.p>
          )}

          {/* ── Meta strip. Rules top AND bottom, so it reads as a band rather
                than an underlined line. Both scale from the left on entrance,
                per the site's rule for dividers. ── */}
          {metaBits && (
            <div
              className="flex w-full flex-col"
              style={{ marginTop: "clamp(22px, min(2.4vw, 3.5vh), 42px)" }}
            >
              {[0, 1].map((edge) => (
                <div key={edge} className={edge === 0 ? "" : "order-last"}>
                  <motion.div
                    aria-hidden
                    className="h-[1px] w-full origin-left"
                    style={{ background: "#D8D3C8" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: edge * 0.1 }}
                  />
                </div>
              ))}
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
                style={{
                  ...LABEL_STYLE,
                  lineHeight: 1.6,
                  paddingTop: "clamp(12px, 1.3vw, 20px)",
                  paddingBottom: "clamp(12px, 1.3vw, 20px)",
                }}
              >
                {metaBits}
              </p>
            </div>
          )}

          {sections.length > 0 && (
            <div
              className="flex w-full flex-col"
              style={{
                marginTop: "clamp(28px, min(3vw, 4.4vh), 52px)",
                gap: "clamp(24px, min(2.8vw, 4vh), 48px)",
              }}
            >
              {sections.map((s, i) => (
                <Section key={i} section={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Stats. The same component the founder story page renders, on white
            rather than navy. ── */}
      <StatsBand
        heading={post.statsHeading}
        stats={post.stats}
        footnote={post.statsFootnote}
        tone="light"
        maxWidth={COLUMN}
      />

      {(post.closingImage || closingSections.length > 0) && (
        <section
          className="relative w-full bg-white"
          style={{
            paddingTop: "var(--section-py)",
            paddingBottom: "var(--section-py)",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
          }}
        >
          <div className="mx-auto flex w-full flex-col" style={{ maxWidth: COLUMN }}>
            {post.closingImage && (
              <motion.div
                className="relative w-full overflow-hidden bg-[#f0f0f0]"
                style={{ aspectRatio: "16 / 9", borderRadius: "2px" }}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={post.closingImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 768px) 100vw, 1040px"
                  className="object-cover object-center"
                />
              </motion.div>
            )}

            {closingSections.length > 0 && (
              <div
                className="flex w-full flex-col"
                style={{
                  marginTop: post.closingImage ? "clamp(28px, min(3vw, 4.4vh), 52px)" : 0,
                  gap: "clamp(24px, min(2.8vw, 4vh), 48px)",
                }}
              >
                {closingSections.map((s, i) => (
                  <Section key={i} section={s} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
