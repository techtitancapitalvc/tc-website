"use client";

import { useEffect, useRef, useState } from "react";
import RichText, { type RichTextValue } from "@/components/ui/RichText";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { HeroGlow } from "./JoinPortfolio";
import PartVisual, {
  VISUAL_KEYFRAMES,
  type VisualKind,
} from "./TitanEcosystemVisuals";
import {
  SECTION_HEADING_CLASS,
  SECTION_HEADING_STYLE,
  SUBHEADING_CLASS,
  SUBHEADING_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/**
 * /titanecosystem — the long dark rail beneath the hero.
 *
 * Several parts stacked down a vertical line that DRAWS ITSELF as the section
 * scrolls, with a ringed pointer riding the line's growing tip. Opposite each
 * part's copy sits an orbit diagram that grows from a single dot into a ring
 * of six and back again, forever.
 *
 * TWO INDEPENDENT CLOCKS, deliberately:
 *   - the line and the pointer are driven by SCROLL POSITION, so they are a
 *     pure function of where the reader is and reverse perfectly on the way
 *     back up;
 *   - each diagram runs on its own clock, so it is alive even when the page is
 *     still. Scroll-driving them would freeze the section the moment the
 *     reader stopped.
 *
 * LAYOUT. Desktop puts the line down the centre with copy left and diagram
 * right. Mobile moves the line to the far left and stacks copy over diagram
 * beside it — a centred line with two columns either side is unreadable at
 * phone widths.
 */

/* ─────────────────────────────────────────────────────────
   Sanity contract. Every field is optional — whatever the CMS
   doesn't supply falls back to the constants below.
   ───────────────────────────────────────────────────────── */
export interface TitanEcosystemPart {
  title?: string;
  description?: string;
  visual?: VisualKind;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Upload one and this part's button opens a QR pop-up instead of
   *  navigating — see QrDialog. */
  ctaQr?: string;
  ctaQrHeading?: string;
  ctaQrCaption?: string;
}

export interface TitanEcosystemPillarsData {
  heading?: string;
  parts?: TitanEcosystemPart[];
}

const FALLBACK_HEADING = "Titan Ecosystem";

const FALLBACK_BODY =
  "300+ Startups. 500+ Founders. One Family. Being Part Of The Titan Founders Family Means Access To A Trusted, High-Calibre Community Of Builders Who've Faced The Same Walls You're Hitting Right Now.";

const FALLBACK_PARTS: TitanEcosystemPart[] = [
  {
    title: "Titan Founders\nCommunity",
    description: FALLBACK_BODY,
    visual: "orbit",
  },
  {
    title: "The Titan Expert\nCommunity",
    description: FALLBACK_BODY,
    visual: "mandala",
  },
  {
    title: "Titan Job Network",
    description: FALLBACK_BODY,
    visual: "web",
    ctaLabel: "Join Community",
    ctaUrl: "/getinvestment",
  },
  {
    title: "Titan Connect",
    description: FALLBACK_BODY,
    visual: "monogram",
  },
];

/** The pointer that rides the scroll line, at the 40px the design specifies
 *  (40px = 2.31vw at the 1728x1117 reference). */
const POINTER = "clamp(24px, min(2.31vw, 3.58vh), 40px)";

const LINE = "rgba(255,255,255,0.22)";

/** The CTA's look, shared by the link and the QR trigger so the two can never
 *  drift apart. */
const CTA_CLASS =
  "mt-[clamp(20px,min(2.4vw,3.7vh),42px)] inline-flex w-fit items-center justify-center rounded-full bg-white text-[#00112E] transition-colors duration-300 hover:bg-[#DCE8FF]";
const CTA_STYLE: React.CSSProperties = {
  padding: "clamp(10px, min(1.1vw, 1.7vh), 18px) clamp(20px, min(2.2vw, 3.4vh), 38px)",
  fontWeight: 600,
  fontSize: "clamp(12px, min(1.26vw, 2.0vh), 17px)",
};

/* ─────────────────────────────────────────────────────────
   THE QR POP-UP.

   Shown when a part has a QR uploaded — that image is the whole switch, so a
   part without one keeps its button as an ordinary link and no other part on
   the rail is touched.

   IT IS PORTALLED TO <body>, which is not a detail. `position: fixed` is
   measured against the nearest ancestor that has a transform, and this rail is
   full of them — every part animates in on `y`, and the section carries the
   cursor glow. Rendered in place, the pop-up would centre itself inside a
   part's card rather than on the screen. The portal takes it out of that
   chain entirely.
   ───────────────────────────────────────────────────────── */
/** Each thing inside the card rises as the card settles. */
const QR_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function QrDialog({
  src,
  heading,
  caption,
  onClose,
}: {
  src: string;
  heading?: string;
  caption?: string;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    /* Lenis owns the scroll, so `overflow: hidden` on the body does nothing —
       it has to be told to stop, and started again on the way out. */
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [lenis, onClose]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      /* `perspective` here is what turns the card's rotateX below into depth
         rather than a squash — it has to sit on the PARENT of the thing that
         rotates. */
      style={{ padding: "24px", perspective: "1000px" }}
      initial={{ opacity: 0, backgroundColor: "rgba(0,17,46,0)", backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(0,17,46,0.55)", backdropFilter: "blur(6px)" }}
      exit={{ opacity: 0, backgroundColor: "rgba(0,17,46,0)", backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={heading || "QR code"}
    >
      <motion.div
        className="relative flex w-full flex-col items-center bg-white"
        style={{
          maxWidth: "clamp(280px, min(24vw, 40vh), 350px)",
          borderRadius: "2px",
          padding: "clamp(22px, min(2.2vw, 3.4vh), 34px)",
        }}
        /* Tips up and settles as it comes toward the reader, rather than
           simply fading. `transformPerspective` keeps the tilt honest even if
           the parent's perspective is ever removed. */
        initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: 20, scale: 0.94, rotateX: 6 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
          // Contents follow the card in, one after another.
          staggerChildren: 0.09,
          delayChildren: 0.14,
        }}
        // The backdrop closes; a click on the card itself must not.
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          variants={QR_ITEM}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute left-[clamp(12px,1.2vw,20px)] top-[clamp(12px,1.2vw,20px)] flex items-center justify-center text-[#0E0E0E] transition-opacity duration-200 hover:opacity-60"
          style={{ width: "24px", height: "24px", lineHeight: 1 }}
        >
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </motion.button>

        {heading && (
          <motion.p
            variants={QR_ITEM}
            className="m-0 text-center font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
            style={{
              marginTop: "clamp(14px, 1.4vw, 22px)",
              fontSize: "clamp(15px, min(1.3vw, 2vh), 18px)",
              lineHeight: 1.4,
            }}
          >
            {heading}
          </motion.p>
        )}

        <motion.div
          variants={QR_ITEM}
          className="relative w-full overflow-hidden"
          style={{
            marginTop: "clamp(14px, 1.4vw, 22px)",
            aspectRatio: "1 / 1",
            maxWidth: "clamp(180px, min(15vw, 26vh), 230px)",
          }}
        >
          <Image
            src={src}
            alt={heading || "QR code"}
            fill
            sizes="230px"
            className="object-contain"
            // A QR must not be resampled soft or a phone may fail to read it.
            unoptimized
          />

          {/* A SCAN SWEEP over the code, once, as it lands. It reads as the
              thing being scanned, which is what the card is asking for — and
              it is `pointer-events-none` over the image so it cannot get in
              the way of a long-press to save. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{
              height: "42%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(120,170,255,0.30) 45%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0) 100%)",
            }}
            initial={{ top: "-45%", opacity: 0 }}
            animate={{ top: ["-45%", "105%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.1,
              times: [0, 0.15, 0.8, 1],
              ease: [0.22, 1, 0.36, 1],
              delay: 0.5,
            }}
          />
        </motion.div>

        {caption && (
          <motion.p
            variants={QR_ITEM}
            className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#4a4a4a]"
            style={{
              marginTop: "clamp(12px, 1.2vw, 18px)",
              fontSize: "clamp(11px, min(0.85vw, 1.3vh), 13px)",
              lineHeight: 1.5,
            }}
          >
            {caption}
          </motion.p>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

/**
 * HOW FAR EACH HALF STOPS SHORT OF THE CENTRE LINE.
 *
 * The copy and the diagram must use the SAME value: the copy applies it as
 * padding on its line-facing side, and the diagram applies the identical
 * padding on its own. That makes every part a mirror about the line — the same
 * gap to it from both sides, and the diagram comes out the same width as the
 * copy.
 *
 * It is written out longhand at all four call sites, and cannot be hoisted
 * into a constant: Tailwind generates classes by scanning the source for
 * LITERAL strings, so `md:pl-[${INSET}]` produces a class name at runtime that
 * was never compiled and silently does nothing. Change one, change all four.
 *
 *     md:pl-[clamp(32px,min(4.5vw,7vh),80px)]
 *     md:pr-[clamp(32px,min(4.5vw,7vh),80px)]
 */

export default function TitanEcosystemPillarsClient({
  data,
}: {
  data?: TitanEcosystemPillarsData | null;
}) {
  const heading = data?.heading || FALLBACK_HEADING;
  const parts =
    data?.parts && data.parts.length > 0 ? data.parts : FALLBACK_PARTS;

  /* Which part's QR is open, by index. Null is closed. Keyed by index rather
     than a boolean so two parts could each carry their own QR without
     clashing. */
  const [qrOpen, setQrOpen] = useState<number | null>(null);

  const railRef = useRef<HTMLDivElement>(null);
  /* The glow measures the cursor against THIS section, so the flashlight
     stays under the pointer however far down the page the section sits. */
  const sectionRef = useRef<HTMLElement>(null);

  /* Progress across the rail. The offsets start the line as the rail's top
     reaches the middle of the screen and finish as its bottom does, so the
     pointer is always somewhere the reader is actually looking. */
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start center", "end center"],
  });

  /* Softened before it drives anything: raw scroll is stepped on a wheel, and
     a pointer bound straight to it stutters. */
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });

  const lineScaleY = progress;
  const pointerTop = useTransform(progress, (p) => `${p * 100}%`);
  /* The glow swells as the pointer moves and settles at either end. */
  const pointerGlow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "0 0 12px rgba(255,255,255,0.35)",
      "0 0 26px rgba(150,190,255,0.75)",
      "0 0 12px rgba(255,255,255,0.35)",
    ]
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#00112E] font-['Poppins',_sans-serif]"
      style={{
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{VISUAL_KEYFRAMES()}</style>

      {/* The hero's aurora: two wandering blobs that parallax against the
          cursor, plus the flashlight blob that follows it. Imported rather
          than copied — this is the SAME component the home hero renders, so
          the two cannot drift apart.

          It replaces the single static glow that used to sit behind the copy;
          keeping both would have muddied the left side. */}
      <HeroGlow sectionRef={sectionRef} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        {/* ── SECTION HEADING ── */}
        <motion.h2
          className={`m-0 text-center font-semibold text-white ${SECTION_HEADING_CLASS}`}
          style={{
            ...SECTION_HEADING_STYLE,
            marginBottom: "clamp(40px, min(5vw, 7.7vh), 86px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {heading}
        </motion.h2>

        {/* ── THE RAIL ──
            `--rail-x` is the line's horizontal position, and everything that
            has to sit on the line reads from it, so the track, the drawn line
            and the pointer can never drift apart. */}
        <div
          ref={railRef}
          className="relative"
          style={
            {
              "--rail-x": "50%",
              "--rail-x-mobile": "clamp(14px, 5vw, 26px)",
            } as React.CSSProperties
          }
        >
          {/* Unlit track — the full path, faint. */}
          <div
            aria-hidden
            className="absolute top-0 z-0 h-full w-[1px] max-md:!left-[var(--rail-x-mobile)]"
            style={{ left: "var(--rail-x)", background: LINE }}
          />

          {/* The line drawing itself. scaleY from a top origin, per the site's
              rule that every divider animates its scale rather than fading. */}
          <motion.div
            aria-hidden
            className="absolute top-0 z-0 h-full w-[1px] origin-top max-md:!left-[var(--rail-x-mobile)]"
            style={{
              left: "var(--rail-x)",
              scaleY: lineScaleY,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(150,190,255,0.85) 100%)",
            }}
          />

          {/* Pointer — 40px ring, 1px white stroke, riding the line's tip. */}
          <motion.div
            aria-hidden
            className="absolute z-20 rounded-full max-md:!left-[var(--rail-x-mobile)]"
            style={{
              left: "var(--rail-x)",
              top: pointerTop,
              width: POINTER,
              height: POINTER,
              x: "-50%",
              y: "-50%",
              border: "1px solid #FFF",
              background: "rgba(0,17,46,0.75)",
              boxShadow: pointerGlow,
            }}
          />

          {/* ── PARTS ──
              The columns SWAP every other part: copy left / diagram right,
              then diagram left / copy right. Done with grid `order` rather
              than by reordering the JSX, so the DOM keeps a single reading
              order — heading, then its copy, then its diagram — no matter
              which side each lands on visually. */}
          {parts.map((part, i) => {
            const diagramLeft = i % 2 === 1;
            /* The two landscape diagrams mirror the copy; the two circular
               ones stay centred in their half. See the cell below. */
            const wide = part.visual === "web" || part.visual === "monogram";
            return (
              <div
                key={i}
                className="relative grid items-center gap-[var(--part-gap)] md:grid-cols-2 max-md:pl-[clamp(44px,14vw,72px)]"
                style={{
                  /* Hoisted so the diagram cell can cancel it — see below. */
                  ["--part-gap" as string]: "clamp(28px, min(4vw, 6vh), 72px)",
                  /* Generous, because the rail's length is what gives the line
                     something to draw across. */
                  paddingTop: i === 0 ? 0 : "clamp(56px, min(7vw, 11vh), 128px)",
                  paddingBottom: "clamp(56px, min(7vw, 11vh), 128px)",
                }}
              >
                {/* Copy — padded on whichever side faces the centre line. */}
                <motion.div
                  className={`flex flex-col ${
                    diagramLeft
                      ? "md:order-2 md:pl-[clamp(32px,min(4.5vw,7vh),80px)]"
                      : "md:order-1 md:pr-[clamp(32px,min(4.5vw,7vh),80px)]"
                  }`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3
                    className={`m-0 whitespace-pre-line font-semibold text-white ${SUBHEADING_CLASS}`}
                    style={SUBHEADING_STYLE}
                  >
                    {part.title}
                  </h3>

                  {/* Divider — scales out from the left on entrance. */}
                  <motion.div
                    aria-hidden
                    className="h-[1px] w-full origin-left"
                    style={{
                      background: LINE,
                      marginTop: "clamp(14px, min(1.8vw, 2.8vh), 31px)",
                      marginBottom: "clamp(14px, min(1.8vw, 2.8vh), 31px)",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.15,
                    }}
                  />

                  <div
                    className={`m-0 font-normal text-white/70 ${HERO_BODY_CLASS}`}
                    style={HERO_BODY_STYLE}
                  >
                    <RichText value={part.description} />
                  </div>

                  {/* A QR on this part turns the button into a trigger; with
                      none it stays the link it has always been. Same styling
                      either way, so the two are indistinguishable until
                      clicked. */}
                  {part.ctaLabel &&
                    (part.ctaQr ? (
                      <button
                        type="button"
                        onClick={() => setQrOpen(i)}
                        className={CTA_CLASS}
                        style={CTA_STYLE}
                      >
                        {part.ctaLabel}
                      </button>
                    ) : (
                      <Link
                        href={part.ctaUrl || "#"}
                        className={CTA_CLASS}
                        style={CTA_STYLE}
                      >
                        {part.ctaLabel}
                      </Link>
                    ))}
                </motion.div>

                {/* Diagram — centred between the LINE and the outer gutter.
                    Centring in the grid cell alone is not that: the gutter
                    puts the cell's inner edge half a gap away from the line,
                    which lands the diagram gap/4 (16.5px at 1728) off centre.
                    Pulling the cell back by half a gap ON ITS INNER SIDE makes
                    its box run exactly from the line to the outer edge, so
                    centring in it is centring in that half of the page. The
                    side that gets the negative margin flips with the column. */}
                <motion.div
                  className={`flex justify-center ${
                    diagramLeft
                      ? "md:order-1 md:mr-[calc(-0.5*var(--part-gap))]"
                      : "md:order-2 md:ml-[calc(-0.5*var(--part-gap))]"
                  } ${
                    wide
                      ? diagramLeft
                        ? "md:pr-[calc(0.5*var(--part-gap)+clamp(32px,min(4.5vw,7vh),80px))]"
                        : "md:pl-[calc(0.5*var(--part-gap)+clamp(32px,min(4.5vw,7vh),80px))]"
                      : ""
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PartVisual kind={part.visual || "orbit"} />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The pop-up lives at the SECTION level, not inside a part — it is
          portalled to <body> from here, so it centres on the screen. */}
      <AnimatePresence>
        {qrOpen !== null && parts[qrOpen]?.ctaQr && (
          <QrDialog
            key={qrOpen}
            src={parts[qrOpen].ctaQr!}
            heading={parts[qrOpen].ctaQrHeading}
            caption={parts[qrOpen].ctaQrCaption}
            onClose={() => setQrOpen(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
