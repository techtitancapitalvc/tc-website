"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { HeroGlow, AnimatedGrid, RevealLine } from "./BackedEarlyClient";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
} from "@/styles/heroTypography";

/*
  FoundersStoryHero
  ─────────────────
  Same dark animated background as BackedEarly (HeroGlow + AnimatedGrid on
  #00112E). Centered per-character reveal heading "A CENTRAL HUB FOR
  FOUNDERS", with a full-bleed row of 4 founder photos anchored at the
  bottom of the hero.
*/

export interface FoundersStoryHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  founderImages?: string[];
}

const FALLBACK_LINE_ONE = "A Central Hub";
const FALLBACK_LINE_TWO = "For Founders";
const FALLBACK_FOUNDERS = [
  "/images/FoundersStory/founder1.webp",
  "/images/FoundersStory/founder2.webp",
  "/images/FoundersStory/founder3.webp",
  "/images/FoundersStory/founder4.webp",
];

/* ── The marquee ──
   ONE TILE WIDTH ON EVERY SCREEN: a quarter of the viewport, so four sit
   across the strip at any size and it reads the way the design does. The row
   used to drop to two-up below `md`; it no longer does. */
const MARQUEE_TILE = "25vw";
/* Pixels per second, NOT a duration. A fixed duration would crawl on a phone
   and race on a wide monitor, because the same distance is a different share
   of the screen. Holding the speed keeps it reading the same everywhere, and
   unchanged when photos are added in Sanity. */
const MARQUEE_SPEED = 110;
/* How quickly a flick bleeds back into the cruising speed, in seconds. Long
   enough that a throw coasts rather than snapping back. */
const MARQUEE_SETTLE = 0.85;
/* A throw cannot exceed this, or one hard flick blurs the strip. */
const MARQUEE_MAX_FLING = 2600;
/* The gap belongs to each tile, not to the track, and that is what makes the
   loop seamless: every tile occupies exactly `tile + gap`, so a whole set is
   an exact multiple of that and the shift lands flush. A `gap` on the flex
   track would leave the join between two sets one gap wider than every other
   join — a stutter once per cycle. */
const MARQUEE_GAP = "clamp(8px, 1vw, 16px)";

const MARQUEE_CSS = `
.fs-marquee-viewport { cursor: grab; touch-action: pan-y; }
.fs-marquee-viewport[data-dragging="true"] { cursor: grabbing; }
.fs-marquee-viewport img { -webkit-user-drag: none; user-select: none; }
`;

export default function FoundersStoryHero({
  data,
}: {
  data?: FoundersStoryHeroData | null;
}) {
  const lineOne = data?.headingLineOne || FALLBACK_LINE_ONE;
  const lineTwo = data?.headingLineTwo ?? FALLBACK_LINE_TWO;
  /* The row is a four-up grid, so an empty array would leave a bare strip of
     navy where the photos belong — fall back rather than render nothing. */
  const founders = data?.founderImages?.length
    ? data.founderImages
    : FALLBACK_FOUNDERS;

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (inView) setShow(true);
  }, [inView]);

  /* ── HOW MANY COPIES OF THE PHOTO SET THE TRACK NEEDS ──
     The strip only ever travels one set's width before wrapping, so at the
     furthest point the visible window reaches `setWidth + viewportWidth` into
     the track. Everything up to there has to be photographs:

         copies x setWidth  >=  setWidth + viewportWidth

     `ceil(viewport / setWidth) + 1` is the smallest count that satisfies it.
     Four photos at 25vw come to 100vw, so two copies do it today — but the
     editor decides how many photos there are, and at two photos a hard-coded
     pair would run the strip dry every cycle. Measured, it just adds copies. */
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const set = setRef.current;
    if (!viewport || !set) return;

    const measure = () => {
      /* A set's width is fixed by its own tiles, so reading it here can never
         be changed by the copy count set below — no feedback loop. */
      const w = set.getBoundingClientRect().width;
      if (!w) return;
      setSetWidth(w);
      setCopies(Math.max(2, Math.ceil(viewport.clientWidth / w) + 1));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(set);
    return () => ro.disconnect();
  }, [founders.length]);

  /* ── THE LOOP, AND THE DRAG ──
     Driven per frame rather than by a CSS keyframe. A keyframe cannot be
     nudged: to drag the strip you have to be able to move it yourself, and a
     running animation would keep overwriting whatever you set.

     THE LOOP IS THE MODULO. `offset` is kept inside [0, setWidth) every frame,
     so the strip never runs off its own end — it is not a long track that
     restarts, it is one set's worth of travel repeating forever. Dragging
     wraps through the same modulo, so you can throw it as far as you like in
     either direction and it stays continuous. */
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(MARQUEE_SPEED);
  const draggingRef = useRef(false);
  const setWidthRef = useRef(0);
  setWidthRef.current = setWidth;

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let prev = performance.now();
    let onScreen = true;

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0 });
    io.observe(viewport);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* Capped: a backgrounded tab resumes with one huge gap, which would
         teleport the strip a whole screen sideways in a single frame. */
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const setW = setWidthRef.current;
      if (!setW || !onScreen) return;

      if (!draggingRef.current) {
        // Ease whatever speed the strip is carrying back to its cruise, so a
        // flick coasts down instead of stopping dead.
        const target = reduced ? 0 : MARQUEE_SPEED;
        velocityRef.current +=
          (target - velocityRef.current) * (1 - Math.exp(-dt / MARQUEE_SETTLE));
        offsetRef.current += velocityRef.current * dt;
      }

      offsetRef.current = ((offsetRef.current % setW) + setW) % setW;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  /* Pointer events rather than mouse/touch pairs: one path covers mouse, pen
     and finger, and pointer capture keeps the drag alive when the cursor
     leaves the strip mid-throw. */
  const dragRef = useRef({ x: 0, t: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    velocityRef.current = 0;
    dragRef.current = { x: e.clientX, t: performance.now() };
    /* Capture is a nicety, not a requirement — the drag works from the events
       alone. Some pointer ids cannot be captured and throw, and losing the
       strip to an exception would be a worse trade than losing the capture. */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    e.currentTarget.dataset.dragging = "true";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - dragRef.current.x;
    const dt = (now - dragRef.current.t) / 1000;
    // Drag right, content goes right — so the offset moves against the finger.
    offsetRef.current -= dx;
    if (dt > 0) {
      velocityRef.current = Math.max(
        -MARQUEE_MAX_FLING,
        Math.min(MARQUEE_MAX_FLING, -dx / dt)
      );
    }
    dragRef.current = { x: e.clientX, t: now };
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    /* The release keeps whatever velocity the last move measured, and the
       ticker eases it back to cruise — that is the throw. A pointer that has
       been still for a moment before release has a velocity near zero, so
       letting go without moving does not fling anything. */
    e.currentTarget.dataset.dragging = "false";
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col overflow-hidden bg-[#00112E] min-h-[100svh]"
      style={{
        paddingTop: "calc(var(--nav-height) + clamp(20px, min(4vw, 6vh), 60px))",
        paddingBottom: 0,
      }}
    >
      <HeroGlow />
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-between">
        {/* ── HEADING ── */}
        <div className="flex w-full flex-1 flex-col items-center justify-center px-[var(--section-px-wide)]">
          <h1
            className={`m-0 flex w-full flex-col items-center justify-center text-center text-white ${HERO_HEADING_DARK_CLASS}`}
            style={HERO_HEADING_DARK_STYLE}
          >
            <RevealLine show={show} delay={0}>{lineOne}</RevealLine>
            {lineTwo && (
              <RevealLine show={show} delay={0.5}>{lineTwo}</RevealLine>
            )}
          </h1>
        </div>

        {/* ── FULL-BLEED MARQUEE OF FOUNDER PHOTOS ──
            Four across at any width, travelling left, looping seamlessly. */}
        <motion.div
          ref={viewportRef}
          className="fs-marquee-viewport w-full shrink-0 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <style>{MARQUEE_CSS}</style>
          <div ref={trackRef} className="fs-marquee-track flex w-max">
            {Array.from({ length: copies }, (_, copy) => (
              <div
                key={copy}
                ref={copy === 0 ? setRef : undefined}
                className="flex shrink-0"
                /* Only the first set is announced; the rest are the same
                   photographs again and would only repeat themselves. */
                aria-hidden={copy > 0 || undefined}
              >
                {founders.map((src, i) => (
                  <div
                    key={`${copy}-${i}`}
                    className="relative shrink-0 overflow-hidden bg-[#0e1120]"
                    style={{
                      width: MARQUEE_TILE,
                      marginRight: MARQUEE_GAP,
                      aspectRatio: "1433 / 1167",
                    }}
                  >
                    <Image
                      src={src}
                      alt={copy === 0 ? `Founder ${i + 1}` : ""}
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
