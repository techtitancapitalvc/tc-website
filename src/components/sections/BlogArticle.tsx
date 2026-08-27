"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RollingNumber } from "./StatsBand";
import { BlogCard, toBlog, type Blog, type BlogPostCard } from "./BlogsClient";
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
 * /blogs/[slug] — the article.
 *
 * Laid out as ACTS, the same shape the founder stories use: an eyebrow, a
 * title, body with a drop cap, and cream asides. The pieces are built here
 * rather than imported from FounderStorySections because that file is the
 * founder story's own layout — the two pages happen to look alike today, and
 * wiring them together would mean a change to one silently redesigning the
 * other.
 *
 * TYPE SCALE, by level:
 *   explore heading          LEVEL 3
 *   title, act titles, pull quotes, stat figures   LEVEL 4
 *   excerpt, body            LEVEL 5
 *   meta line, eyebrows, attributions, browse link LEVEL 6
 *   stat labels              LEVEL 7
 *
 * EVERY PART HIDES ITSELF WHEN EMPTY — acts, quotes, figures, pictures, the
 * explore band. A post can be a header and three paragraphs and nothing
 * renders around it.
 */

export interface BlogStat {
  num?: string;
  label?: string;
}

export interface BlogAct {
  eyebrow?: string;
  title?: string;
  body?: string[];
  bodyBold?: string;
  quote?: { text?: string; attribution?: string };
  /** Cream figures strip. It belongs to the ACT rather than to the page, so it
   *  lands part way down where the piece wants it instead of only at the end. */
  stats?: BlogStat[];
  /** Full-width picture, after the aside. */
  image?: string;
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
  acts?: BlogAct[];
  exploreHeading?: string;
  exploreBrowseLabel?: string;
  exploreBrowseHref?: string;
}

const CREAM = "#FBF7F0";
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
   1. HEADER — meta, title, one-liner, cover
   ═══════════════════════════════════════════════════════════ */
function BlogHeader({ post }: { post: BlogPostData }) {
  /* The line ABOVE the title: author and category, at level 6. Built from
     whatever is filled in, so a post with no author still reads properly
     rather than opening on a stray separator. */
  const meta = [post.author, post.category && `Category: ${post.category}`]
    .filter(Boolean)
    .join("  ·  ");

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
            <Link
              href="/blogs"
              className="font-light transition-opacity duration-200 hover:opacity-70"
            >
              Blogs
            </Link>
            <span className="font-light"> / </span>
            <span className="font-medium">{post.category || post.title}</span>
          </p>
        </div>

        <motion.div
          className="flex w-full flex-col"
          style={{ marginTop: "clamp(28px, min(3.2vw, 4.6vh), 62px)" }}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {meta && (
            <motion.p
              variants={RISE}
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
              style={LABEL_STYLE}
            >
              {meta}
            </motion.p>
          )}

          {post.title && (
            <motion.h1
              variants={RISE}
              className={`m-0 font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
              style={{
                ...SUBHEADING_STYLE,
                lineHeight: 1.28,
                marginTop: "clamp(8px, min(0.9vw, 1.3vh), 16px)",
              }}
            >
              {post.title}
            </motion.h1>
          )}

          {post.excerpt && (
            <motion.p
              variants={RISE}
              className={`m-0 font-normal text-[#3d3d3d] ${HERO_BODY_CLASS}`}
              style={{
                ...HERO_BODY_STYLE,
                lineHeight: 1.6,
                marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
              }}
            >
              {post.excerpt}
            </motion.p>
          )}

          {post.coverImage && (
            <motion.div
              variants={RISE}
              className="relative w-full overflow-hidden bg-[#f0f0f0]"
              style={{
                marginTop: "clamp(24px, min(2.8vw, 4vh), 52px)",
                aspectRatio: "16 / 9",
                borderRadius: "2px",
              }}
            >
              <Image
                src={post.coverImage}
                alt={post.title || ""}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. ACTS
   ═══════════════════════════════════════════════════════════ */
function BlogActs({ acts }: { acts?: BlogAct[] }) {
  const real = (acts ?? []).filter((a) => a.title || a.body?.length);
  if (real.length === 0) return null;

  return (
    <section
      className="relative w-full bg-white"
      style={{
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
          const figures = (act.stats ?? []).filter((s) => s.num);
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
                    marginTop:
                      j === 0
                        ? "clamp(18px, min(2vw, 2.9vh), 34px)"
                        : "clamp(10px, 1.2vw, 18px)",
                  }}
                >
                  {/* Drop cap on the opening letter only. `float` rather than a
                      separately positioned span, so the text wraps around it
                      instead of the first line being indented by a guess. */}
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

              {/* FIGURES — on the same cream slab as the quote, so the two read
                  as one kind of aside rather than two. Inline in the column
                  rather than a full-bleed band: it sits part way down the
                  piece, between acts. Columns come from the COUNT, so three
                  figures do not sit lopsided in a grid built for four. */}
              {figures.length > 0 && (
                <motion.div
                  variants={RISE}
                  className="w-full"
                  style={{
                    marginTop: "clamp(28px, min(3vw, 4.4vh), 54px)",
                    background: CREAM,
                    borderLeft: "3px solid #0E0E0E",
                    borderRadius: "0 2px 2px 0",
                    padding: "clamp(22px, min(2.6vw, 3.8vh), 40px)",
                  }}
                >
                  {/* A SEPARATE, PURE STAGGER CONTAINER inside the slab. The
                      slab keeps its own entrance above; this one only spaces
                      its children, at the 0.5s that lets each figure finish
                      rolling before the next starts — the same cadence as the
                      portfolio bar and the founder story's band.

                      The figures used to sit directly on the slab, so they all
                      rolled at once: without a container staggering them, every
                      digit column started on the same frame. */}
                  <motion.div
                    className="grid w-full max-md:!grid-cols-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(figures.length, 4)}, minmax(0, 1fr))`,
                      gap: "clamp(18px, min(2vw, 3vh), 34px)",
                    }}
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.5, delayChildren: 0.1 } },
                    }}
                  >
                    {figures.map((s, k) => (
                      <motion.div
                        key={k}
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
                          className={`font-semibold text-[#0E0E0E] ${SUBHEADING_CLASS}`}
                          style={SUBHEADING_STYLE}
                        >
                          <RollingNumber value={s.num!} />
                        </span>
                        {s.label && (
                          <span
                            className="whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
                            style={{
                              ...CAPTION_STYLE,
                              lineHeight: 1.5,
                              marginTop: "clamp(4px, 0.6vw, 10px)",
                            }}
                          >
                            {s.label}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {act.image && (
                <motion.div
                  variants={RISE}
                  className="relative w-full overflow-hidden bg-[#f0f0f0]"
                  style={{
                    marginTop: "clamp(28px, min(3vw, 4.4vh), 54px)",
                    aspectRatio: "16 / 9",
                    borderRadius: "2px",
                  }}
                >
                  <Image
                    src={act.image}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover object-center"
                  />
                </motion.div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. EXPLORE — three more posts
   ═══════════════════════════════════════════════════════════ */
function BlogExplore({
  heading,
  browseLabel,
  browseHref,
  posts,
}: {
  heading?: string;
  browseLabel?: string;
  browseHref?: string;
  posts: Blog[];
}) {
  if (!heading || posts.length === 0) return null;

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
                href={browseHref || "/blogs"}
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
          {posts.slice(0, 3).map((b, i) => (
            /* The SAME card the listing grid renders, white here because it
               sits on cream — the inverse of the listing, where cream cards
               sit on white. */
            <BlogCard key={`${b.href}-${i}`} blog={b} surface="#FFFFFF" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function BlogArticle({
  post,
  more = [],
}: {
  post: BlogPostData;
  /** Other posts for the Explore band, already excluding this one. */
  more?: BlogPostCard[];
}) {
  return (
    <>
      <BlogHeader post={post} />
      <BlogActs acts={post.acts} />
      <BlogExplore
        heading={post.exploreHeading}
        browseLabel={post.exploreBrowseLabel}
        browseHref={post.exploreBrowseHref}
        posts={more.map(toBlog)}
      />
    </>
  );
}
