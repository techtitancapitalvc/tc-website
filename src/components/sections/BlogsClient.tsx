"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Blogs listing — featured note + category/search filter bar +
   a bordered card grid (same scroll-drawn dividers as the
   FoundersStory grid). Buttons reuse the site's navy pill style.
   ───────────────────────────────────────────────────────── */

/* .jpeg, not .png — the file on disk is skyscrappers.jpeg, so the old path
   404'd and every placeholder card rendered a broken image. */
const BLOG_IMAGE = "/images/indicorns/skyscrappers.jpeg";

export interface Blog {
  id: number;
  image: string;
  author: string;
  readTime: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  /** Pills above the meta line. Optional — a post with none simply omits them. */
  tags?: string[];
}

const CATEGORIES = [
  "Investment Theses",
  "Founder Playbooks",
  "Portfolio News",
  "Titan View",
];

const makeBlog = (id: number): Blog => ({
  id,
  image: BLOG_IMAGE,
  author: "Kunal Bahl",
  readTime: "12 Min Read",
  category: "Investment Thesis",
  title: "The India D2C Playbook: What 50 Investments Taught Us",
  excerpt:
    "The Patterns, The Misfires, And The Counterintuitive Lessons From A Decade Of Backing Consumer Brands In India.",
  href: "#",
  tags: ["D2C", "Consumer Brand", "IPO 2023"],
});

/* Placeholders, used only until posts exist in Sanity. */
const FALLBACK_POSTS: Blog[] = Array.from({ length: 9 }, (_, i) => makeBlog(i));

/** What the listing receives from Sanity — see allBlogPostsQuery. */
export interface BlogPostCard {
  slug?: string;
  title?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  category?: string;
  publishedAt?: string;
  /** "left" | "right" | "none" — see the `placement` field in blogPost. */
  placement?: string;
  /** Superseded by `placement`; still read as a fallback. */
  featured?: boolean;
}

/** Sanity shape -> the shape the cards already expect. */
export function toBlog(p: BlogPostCard, i: number): Blog {
  return {
    id: i,
    image: p.coverImage || BLOG_IMAGE,
    author: p.author || "",
    readTime: p.readTime || "",
    category: p.category || "",
    title: p.title || "",
    excerpt: p.excerpt || "",
    // Trim stray slashes: a slug typed as "/bobabhai" would otherwise build
    // "/blogs//bobabhai", which is not the route and 404s.
    href: p.slug?.replace(/^\/+|\/+$/g, "") ? `/blogs/${p.slug.replace(/^\/+|\/+$/g, "")}` : "#",
    tags: p.tags,
  };
}

const STORY_GAP = "calc(var(--section-px-wide) * 0.4)";
// No outer inset — the grid aligns to the same left/right gutter as the
// featured card and the filter bar; only the internal dividers show.
const BORDER_PADDING = "0px";
const NAVY = "#001A4D";

/* ── Cursor-fill pill (Read Note / Search) ──
   Same interaction as JoinPortfolio's CursorFillButton: a white fill
   grows from the cursor's entry point and the label flips to navy. */
function NavyPill({
  label,
  href,
  onClick,
  small,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  small?: boolean;
}) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);

  const track = (e: React.MouseEvent<HTMLElement>, next: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setHovered(next);
  };

  const cls =
    "relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap font-['Poppins',_sans-serif] font-medium transition-colors duration-300";
  const style: React.CSSProperties = {
    padding: small ? "8px 20px" : "12px 30px",
    fontSize: small ? "clamp(12px, 1vw, 14px)" : "clamp(13px, 1.05vw, 15px)",
    borderRadius: 9999,
    background: NAVY,
    border: `1px solid ${NAVY}`,
    color: hovered ? NAVY : "#fff",
  };

  const inner = (
    <>
      <span
        className="absolute inset-0 bg-white transition-transform duration-[400ms] ease-out"
        style={{ transformOrigin: origin, transform: hovered ? "scale(1)" : "scale(0)", borderRadius: "inherit" }}
      />
      <span className="relative z-10">{label}</span>
    </>
  );

  return href ? (
    <Link
      href={href}
      onMouseEnter={(e) => track(e, true)}
      onMouseLeave={(e) => track(e, false)}
      className={cls}
      style={style}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => track(e, true)}
      onMouseLeave={(e) => track(e, false)}
      className={cls}
      style={style}
    >
      {inner}
    </button>
  );
}

function MetaLine({ blog, reserve }: { blog: Blog; reserve?: boolean }) {
  /* Built from whatever is actually filled in. Joining unconditionally left a
     post with no author or read time opening on bare separators and a dangling
     "Category:" — the separator belongs BETWEEN parts, so there is no line at
     all when there are no parts.

     `reserve` is for the grid, where cards sit side by side: there the empty
     line still has to occupy its row, or the card without a byline pulls every
     line below it up out of step with its neighbours. */
  const meta = [blog.author, blog.readTime, blog.category && `Category: ${blog.category}`]
    .filter(Boolean)
    .join(" · ");
  if (!meta) return reserve ? <p className="m-0" style={{ fontSize: "clamp(11px, 0.9vw, 13px)", lineHeight: "150%" }}>&nbsp;</p> : null;
  return (
    <p
      className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b]"
      style={{ fontSize: "clamp(11px, 0.9vw, 13px)", lineHeight: "150%" }}
    >
      {meta}
    </p>
  );
}

/* ── Tag pills ── */
function Tags({ tags, small }: { tags?: string[]; small?: boolean }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap" style={{ gap: small ? "6px" : "8px" }}>
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center whitespace-nowrap rounded-full font-['Poppins',_sans-serif] font-normal text-[#3d3d3d]"
          style={{
            padding: small ? "5px 12px" : "7px 18px",
            fontSize: small
              ? "clamp(10px, 0.78vw, 12px)"
              : "clamp(11px, 0.9vw, 13px)",
            background: "#F5F1EA",
            border: "1px solid #EBE4D8",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── The two cards stacked beside the featured note.
      Image on the left, copy on the right — a landscape card, where the
      featured one is a portrait. Below md it drops to the same stacked shape
      as the grid cards, because a 35% image column at phone width leaves the
      copy in a gutter too narrow to read. ── */
function SideCard({ blog }: { blog: Blog }) {
  return (
    <div className="group flex w-full flex-col bg-white sm:flex-row">
      <div
        className="relative w-full shrink-0 overflow-hidden max-sm:aspect-[16/10] sm:w-[38%] sm:self-stretch"
        style={{ minHeight: "100%" }}
      >
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 640px) 100vw, 22vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div
        className="flex flex-1 flex-col justify-center"
        style={{
          padding: "clamp(16px, 1.5vw, 26px)",
          gap: "clamp(8px, 0.8vw, 12px)",
        }}
      >
        <Tags tags={blog.tags} small />
        <MetaLine blog={blog} />
        <h3
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
          style={{ fontSize: "clamp(17px, 1.45vw, 23px)", lineHeight: "132%" }}
        >
          {blog.title}
        </h3>
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
          style={{ fontSize: "clamp(12px, 1vw, 14px)", lineHeight: "158%" }}
        >
          {blog.excerpt}
        </p>
        <div style={{ marginTop: "clamp(4px, 0.5vw, 8px)" }}>
          <NavyPill label="Read Note" href={blog.href} small />
        </div>
      </div>
    </div>
  );
}

/* ── Card used in the grid ──
   Exported because the article page's "Explore Blog" band renders the SAME
   card, so a card there can never drift from a card on the listing. It takes
   its own surface: beige on the white grid, white on the beige Explore band —
   each is the inverse of what it sits on. ── */
export function BlogCard({
  blog,
  surface = "#FBF7F0",
}: {
  blog: Blog;
  surface?: string;
}) {
  return (
    <div className="group flex h-full w-full flex-col" style={{ background: surface }}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 11" }}>
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div
        className="flex flex-1 flex-col"
        style={{
          padding: "clamp(16px, 1.4vw, 22px) clamp(16px, 1.4vw, 22px) clamp(20px, 1.7vw, 28px)",
          gap: "clamp(8px, 0.9vw, 14px)",
        }}
      >
        {/* EVERY ROW OF A CARD LINES UP WITH THE SAME ROW OF ITS NEIGHBOURS.
            `reserve` keeps the meta line's height on a post that has no author
            or category, so its title does not ride up while the card beside it
            starts a line lower. */}
        <MetaLine blog={blog} reserve />
        <h3
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
          style={{
            fontSize: "clamp(18px, 1.5vw, 22px)",
            lineHeight: "130%",
            /* EXACTLY two lines, always. The min-height stops a one-line title
               starting its description a line above its neighbour; the clamp
               stops a three-line title pushing it a line below. Together they
               make the block a fixed size, which is what lets every card in
               the grid agree on where the copy sits. */
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.title}
        </h3>
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
          style={{
            fontSize: "clamp(13px, 1.05vw, 15px)",
            lineHeight: "160%",
            /* Three lines, same reasoning. Without this one long excerpt made
               its row 973px against the others' 613px — and every other row
               was then stretched to match it. */
            minHeight: "4.8em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.excerpt}
        </p>
        {/* `mt-auto` takes up whatever slack the card has, so the button sits
            on the card's floor rather than wherever the copy happened to end.
            This is what the equal-height rows above are for. */}
        <div style={{ marginTop: "auto", paddingTop: "clamp(10px, 1.1vw, 18px)" }}>
          <NavyPill label="Read Note" href={blog.href} small />
        </div>
      </div>
    </div>
  );
}

export default function BlogsClient({ posts }: { posts?: BlogPostCard[] | null }) {
  /* Derived in ONE memo, so the arrays are referentially stable. The filter
     below depends on `BLOGS`, and rebuilding these on every render would make
     that memo recompute every time — which is what the lint rule catches. */
  const { FEATURED, FEATURED_SIDE, BLOGS, categories } = useMemo(() => {
    /* Sanity when there is any, placeholders otherwise — so the page never
       renders as an empty shell while the team is still filling it in. */
    const all: Blog[] = posts?.length ? posts.map(toBlog) : FALLBACK_POSTS;

    /* ── WHO SITS WHERE IN THE SPOTLIGHT ──
       The editor now says it outright, per post: "left" takes the large card,
       "right" joins the scrolling column. `featured` is still honoured for
       posts written before that field existed — the first of them takes the
       left, the rest fall to the right — so nothing has to be re-flagged for
       the block to keep working.

       EVERY SLOT IS THEN TOPPED UP from the remaining posts in date order, so
       a half-set choice (or none at all) still fills the block rather than
       collapsing it. */
    const pick = (want: string) =>
      posts?.length ? all.filter((_, i) => posts[i]?.placement === want) : [];
    const legacy = posts?.length
      ? all.filter((_, i) => posts[i]?.featured && !posts[i]?.placement)
      : all.slice(0, 5);

    const chosenLeft = pick("left")[0] ?? legacy[0];
    const chosenRight = [
      ...pick("right"),
      ...legacy.filter((b) => b !== chosenLeft),
    ];

    const spoken = new Set([chosenLeft, ...chosenRight].filter(Boolean));
    const rest = all.filter((b) => !spoken.has(b));

    const left = chosenLeft ?? rest[0];
    const side = [...chosenRight, ...rest.filter((b) => b !== left)].slice(0, 4);

    return {
      FEATURED: left,
      FEATURED_SIDE: side,
      /* EVERY post, including the three above. The grid used to get only the
         leftovers, so a site with three posts or fewer showed "No notes match
         your search" under the filter bar — and searching could never reach a
         featured post. The header is a spotlight, not a subtraction. */
      BLOGS: all,
      /* Categories come from the posts themselves rather than a hardcoded
         list, so adding one in Sanity is enough — nothing to keep in step. */
      categories: posts?.length
        ? Array.from(new Set(all.map((b) => b.category).filter(Boolean)))
        : CATEGORIES,
    };
  }, [posts]);

  const [category, setCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");

  /* Search matches title or author; category narrows on top of it. The
     category filter used to be display-only because every sample post shared
     one category — with real data it does something, so it is wired up. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOGS.filter(
      (b) =>
        (!q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)) &&
        (!category || b.category === category)
    );
  }, [query, category, BLOGS]);

  const rows = Math.max(1, Math.ceil(filtered.length / 3));

  /* ── THE GRID'S DIVIDERS, DRAWN ON ENTRANCE ──
     They used to be bound to scroll position: `useScroll` on the grid, through
     a transform and a spring, into `scaleX`. MEASURED ACROSS A FULL SCROLL
     SWEEP, that value never left 1 — the rules were simply always drawn, and
     nothing animated. Lenis owns scrolling on this site and moves the page
     from its own loop, so the progress `useScroll` reports never advances.

     `whileInView` is what every other divider here already uses, including the
     one between the spotlight cards a few lines above, and it does not care
     who is driving the scroll. Each line is staggered by its index so the grid
     draws itself in rather than snapping on all at once. */
  const gridRef = useRef<HTMLDivElement>(null);

  /* ONE AXIS EACH. A horizontal rule is a 1px border on a zero-height box, so
     animating its scaleY as well would squash the border itself — it would
     thicken into place rather than extend. Each rule scales only along its own
     length. */
  const RULE_DRAW = (axis: "x" | "y", i: number) => ({
    initial: axis === "x" ? { scaleX: 0 } : { scaleY: 0 },
    whileInView: axis === "x" ? { scaleX: 1 } : { scaleY: 1 },
    viewport: { once: true, amount: 0.2 } as const,
    transition: {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: 0.12 + i * 0.09,
    },
  });

  const hLineTops = Array.from({ length: rows - 1 }, (_, i) => i + 1).map(
    (k) =>
      `calc(var(--bp) + ${k} * ((100% - 2 * var(--bp) - ${rows - 1} * var(--gap)) / ${rows}) + ${k - 0.5} * var(--gap))`
  );
  const vLineLefts = [1, 2].map(
    (j) =>
      `calc(var(--bp) + ${j} * ((100% - 2 * var(--bp) - 2 * var(--gap)) / 3) + ${j - 0.5} * var(--gap))`
  );

  return (
    <>
    <section
      className="relative w-full bg-[#FBF7F0]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ══════════ FEATURED NOTE ══════════
            One tall card on the left, two landscape cards stacked beside it.
            The two halves are independent columns rather than one grid of
            rows: the left card's height is set by its own image and copy, and
            forcing the right pair onto shared row tracks would either stretch
            their images or leave the left one short. `items-start` keeps each
            column measuring itself. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid w-full grid-cols-1 items-start lg:grid-cols-2"
          style={{ gap: "clamp(20px, 2vw, 34px)" }}
        >
          {/* ── The big one. PINNED on desktop: it holds while the four beside
                it scroll past, which is what makes the right-hand column read
                as its own reel rather than a second stack of cards.
                `items-start` on the grid is what lets this work — the grid AREA
                still spans the full row height, so the pin has the side
                column's whole run to hold against. Below lg the two columns are
                stacked, where pinning one over the other would trap the page. ── */}
          <div className="flex w-full flex-col overflow-hidden bg-white lg:sticky lg:top-[calc(var(--nav-height,80px)+clamp(16px,2vw,32px))]">
            <div
              className="group relative w-full overflow-hidden"
              style={{ aspectRatio: "16 / 10" }}
            >
              <Image
                src={FEATURED.image}
                alt={FEATURED.title}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div
              className="flex flex-1 flex-col"
              style={{
                padding: "clamp(20px, 2vw, 34px)",
                gap: "clamp(12px, 1.2vw, 20px)",
              }}
            >
              <Tags tags={FEATURED.tags} />
              <MetaLine blog={FEATURED} />
              <h2
                className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(24px, min(2.5vw, 3.6vh), 36px)",
                  lineHeight: "125%",
                }}
              >
                {FEATURED.title}
              </h2>
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
                style={{
                  fontSize: "clamp(14px, min(1.25vw, 1.8vh), 18px)",
                  lineHeight: "160%",
                }}
              >
                {FEATURED.excerpt}
              </p>
              <div style={{ marginTop: "clamp(6px, 0.8vw, 12px)" }}>
                <NavyPill label="Read Note" href={FEATURED.href} />
              </div>
            </div>
          </div>

          {/* ── The four beside it, which do the scrolling ── */}
          <div className="flex w-full flex-col" style={{ gap: "clamp(20px, 2vw, 34px)" }}>
            {FEATURED_SIDE.map((blog, i) => (
              <div key={blog.id} className="flex w-full flex-col">
                {/* Rule between the pair, drawn from the left on entrance —
                    the site's rule that every divider scales rather than
                    fades. Only between them, never above the first. */}
                {i > 0 && (
                  <motion.div
                    aria-hidden
                    className="h-[1px] w-full origin-left"
                    style={{
                      background: "#0E0E0E",
                      marginBottom: "clamp(20px, 2vw, 34px)",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  />
                )}
                <SideCard blog={blog} />
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>

    {/* ══════════ CARD GRID — ITS OWN SECTION ══════════
        White, where the featured block above is beige, so the two read as
        separate bands rather than one long field. The cards invert with it:
        beige on white here, white on beige there. */}
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col">
        {/* ══════════ FILTER BAR ══════════ */}
        <div
          className="relative z-30 flex w-full flex-col gap-[16px] md:flex-row md:items-center md:justify-between"
        >
          {/* Category dropdown */}
          <div className="relative w-full md:w-auto">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-[40px] rounded-[4px] font-['Poppins',_sans-serif] font-medium text-[#0E0E0E] md:w-auto"
              style={{ fontSize: "clamp(15px, 1.2vw, 18px)" }}
            >
              <span>{category ?? "Category"}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-[calc(100%+12px)] z-40 flex w-[260px] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              >
                {categories.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(active ? null : cat);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-[14px] px-[20px] py-[14px] text-left font-['Poppins',_sans-serif] font-normal text-[#0E0E0E] transition-colors duration-200 hover:bg-[#F5F1EA]"
                      style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
                    >
                      <span
                        className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border"
                        style={{ borderColor: active ? NAVY : "#c9c9c9" }}
                      >
                        {active && <span className="h-[8px] w-[8px] rounded-full" style={{ background: NAVY }} />}
                      </span>
                      {cat}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Search */}
          <div
            /* Beige, not white. The bar moved onto the white grid section, and
               a white field on a white ground is invisible — the border alone
               was doing all the work. It now matches the cards it filters. */
            className="flex w-full items-center rounded-full bg-[#FBF7F0] md:w-[clamp(360px,32vw,460px)]"
            style={{ padding: "6px 6px 6px 20px", border: "1px solid #E6E1D8" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#6b6b6b" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Company name"
              className="min-w-0 flex-1 bg-transparent px-[12px] font-['Poppins',_sans-serif] font-normal text-[#0E0E0E] outline-none placeholder:text-[#9a9a9a]"
              style={{ fontSize: "clamp(14px, 1.05vw, 16px)" }}
            />
            <NavyPill label="Search" onClick={() => { /* filter is live via query state */ }} small />
          </div>
        </div>
        <div
          ref={gridRef}
          className="relative w-full"
          style={{
            marginTop: "clamp(24px, min(2.6vw, 3.8vh), 44px)",
            padding: BORDER_PADDING,
            "--bp": BORDER_PADDING,
            "--gap": STORY_GAP,
          } as React.CSSProperties}
        >
          {filtered.length === 0 ? (
            <p
              className="w-full py-[60px] text-center font-['Poppins',_sans-serif] text-[#6b6b6b]"
              style={{ fontSize: "clamp(14px, 1.2vw, 18px)" }}
            >
              No notes match your search.
            </p>
          ) : (
            <>
              {/* EQUAL ROWS, and that is load-bearing twice over.
                  The dividers below are placed by dividing the grid's height
                  into `rows` equal parts in CSS. Auto-sized rows are each as
                  tall as their own tallest card, so the real boundaries drift
                  from the even split and the rule was landing across the next
                  row's images. `1fr` auto-rows makes every row the height of
                  the tallest card in the grid, which is the assumption that
                  calc was making all along. It is also what lets a card
                  stretch, so `mt-auto` can pin every Read Note to a common
                  baseline. */}
              <div
                className="grid w-full grid-cols-3 max-md:!grid-cols-1 max-md:!gap-[28px]"
                style={{ gap: STORY_GAP, gridAutoRows: "1fr" }}
              >
                {filtered.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* Horizontal dividers between rows */}
              {hLineTops.map((top, idx) => (
                <div key={`h-${idx}`}>
                  {/* Each half draws OUTWARD from the centre line, so a row
                      rule opens from the middle rather than sweeping across. */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute max-md:!hidden z-20"
                    style={{ top, left: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #C9C2B4", transformOrigin: "right" }}
                    {...RULE_DRAW("x", idx)}
                  />
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute max-md:!hidden z-20"
                    style={{ top, right: "var(--bp)", width: "calc(50% - var(--bp))", height: 0, borderTop: "1px solid #C9C2B4", transformOrigin: "left" }}
                    {...RULE_DRAW("x", idx)}
                  />
                </div>
              ))}

              {/* Vertical dividers between columns */}
              {vLineLefts.map((left, idx) => (
                <motion.div
                  key={`v-${idx}`}
                  aria-hidden
                  className="pointer-events-none absolute max-md:!hidden z-20"
                  style={{ top: "var(--bp)", left, width: 0, borderLeft: "1px solid #C9C2B4", height: "calc(100% - 2 * var(--bp))", transformOrigin: "top" }}
                  {...RULE_DRAW("y", idx)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
