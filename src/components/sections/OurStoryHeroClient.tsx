"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import {
  HERO_HEADING_LIGHT_CLASS,
  HERO_HEADING_LIGHT_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurStoryHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface OurStoryHeroData {
  headingFirst?: string;
  headingHighlight?: string;
  quote?: string;
  image?: string;
}

/**
 * THE DRIFTING PHOTO FIELD.
 *
 * Rebuilt from the reference implementation rather than by eye — its bundle
 * (`Particles-0BM77DBr.js`) was read and the constants below are its own, so
 * the motion matches rather than merely resembling it:
 *
 *   1. TILES DRIFT UPWARD, not sideways. `position` is a Y translation that
 *      grows negative, so the field rises from the bottom of the frame.
 *   2. THEY SIT AT REAL DEPTHS. Each tile takes a fixed `z` from Z_STEPS
 *      inside a `perspective: 800px` box, so the near ones are genuinely
 *      larger and the far ones genuinely smaller — parallax, not a fake.
 *   3. THE FAR ONES ARE PALER. A white sheet over each tile carries an
 *      opacity of `1 - tileOpacity`, and tileOpacity falls off with negative
 *      z. That is what makes depth read on a white ground.
 *   4. SCALE IS DRIVEN BY HEIGHT IN THE FRAME. A tile at the bottom is at
 *      SCALE_MAX and shrinks to SCALE_MIN as it climbs, so it recedes as it
 *      rises — on top of whatever its z is already doing.
 *   5. IT WRAPS FOREVER. A tile that leaves the top has its `extra` shifted
 *      by a container height, which drops it back in at the bottom.
 *   6. SCROLLING PUSHES IT. Scroll velocity is added to the drift target and
 *      the sign of the scroll sets the drift direction, so the field speeds
 *      up, slows and reverses under the reader.
 *
 * Two deliberate departures from the reference:
 *
 *   - IT PICKS ITS POSITIONS DETERMINISTICALLY. The original calls
 *     Math.random() at module scope. Here that would run once on the server
 *     and again on the client, the two would disagree, and React would report
 *     a hydration mismatch — so a seeded PRNG stands in. It also means the
 *     field is laid out identically on every load.
 *   - SCROLL COMES FROM LENIS, which is what actually drives scrolling on
 *     this site; a native scroll listener would read a position Lenis is in
 *     the middle of animating.
 */

/** Straight from the reference bundle. */
const CFG = {
  speed: 0.15,
  ease: 0.1,
  scaleEase: 0.25,
  scrollMultiplier: 0.05,
  scaleMin: 0.5,
  scaleMax: 1.4,
};
/** The depth ladder, in px of z. Cycled, so the field is layered evenly. */
const Z_STEPS = [-200, -150, -100, -50, 0, 50, 100, 150, 200];
/** Parallax multipliers, cycled — tiles at the same depth still drift apart. */
const SPEEDS = [0.8, 0.9, 1, 1.1, 1.2];
const COUNT = 32;
const PERSPECTIVE = 800;

/** Deterministic stand-in for the reference's Math.random. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLES = (() => {
  const rand = mulberry32(0x5eed);
  return Array.from({ length: COUNT }, (_, i) => {
    const z = Z_STEPS[i % Z_STEPS.length];
    /* The reference's own falloff: past -100 it clamps, so the furthest tiles
       never fade below half. */
    const opacity = z < 0 ? Math.max(0.5, 1 + z / 250) : 1;
    return {
      x: Math.floor(rand() * 95),
      y: Math.floor(rand() * 100),
      speed: SPEEDS[i % SPEEDS.length],
      z,
      opacity,
    };
  });
})();

/** Photographs to fill the tiles. Cycled, so the count is independent of how
 *  many there happen to be. Swap this array to change the field. */
const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16].map(
  (n) => `/images/hero_founders_images/${n}.png`
);

/** 104px at the 1728 reference, down to 50px on a phone — the reference's own
 *  `w-[50px] md:w-[104px]`, expressed so it also responds to short screens. */
const TILE = "clamp(50px, min(6vw, 9vh), 104px)";

const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

const HERO_CSS = `
@keyframes ourstory-rise {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

function PhotoGalaxy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* Scroll velocity is written by Lenis and read by the ticker. A ref rather
     than state: this changes many times a second and must not re-render. */
  const impulse = useRef({ target: 0, sign: 1 });

  useLenis(({ velocity }: { velocity: number }) => {
    impulse.current.target += velocity * CFG.scrollMultiplier;
    if (velocity !== 0) impulse.current.sign = Math.sign(velocity);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Tile = {
      extra: number;
      height: number;
      top: number;
      position: number;
      currentScale: number;
    };
    const tiles: Tile[] = PARTICLES.map(() => ({
      extra: 0,
      height: 0,
      top: 0,
      position: 0,
      currentScale: 1,
    }));

    let current = 0;
    let last = 0;
    let containerHeight = 0;
    let containerOffsetHeight = 0;
    let raf = 0;
    let prev = performance.now();

    /* Measured with every transform cleared, so `top` is the tile's resting
       place in the container rather than wherever the drift had left it. */
    const measure = () => {
      const rect = container.getBoundingClientRect();
      tileRefs.current.forEach((el, n) => {
        if (!el) return;
        el.style.transform = "translate3d(0, 0px, 0)";
        const r = el.getBoundingClientRect();
        tiles[n].extra = 0;
        tiles[n].height = r.height;
        tiles[n].top = r.top - rect.top;
        tiles[n].position = 0;
        tiles[n].currentScale = 1;
      });
      containerHeight = container.clientHeight;
      containerOffsetHeight = containerHeight * 0.1;
      current = 0;
      last = 0;
      impulse.current.target = 0;
    };

    /* Off screen the frame is still requested but does no work — drifting a
       field nobody can see is pure battery. */
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      /* Milliseconds, and capped: a backgrounded tab resumes with a huge gap
         and would fling the whole field off screen in one frame. */
      const dt = Math.min(50, now - prev);
      prev = now;
      if (!visible || reduced) return;

      impulse.current.target += CFG.speed * dt * impulse.current.sign;
      current = lerp(current, impulse.current.target, CFG.ease);
      const direction = current < last ? "down" : "up";

      tileRefs.current.forEach((el, n) => {
        if (!el) return;
        const t = tiles[n];
        const p = PARTICLES[n];

        t.position = -current * p.speed - t.extra;

        /* WRAPPING. `extra` is a running offset that teleports a tile from one
           end of the container to the other. Note the reference does NOT
           recompute `position` after changing it — the shift lands on the next
           frame — and that is reproduced here rather than tidied, because
           recomputing shows the jump a frame early. */
        const bottom = t.position + t.top + t.height;
        if (direction === "up" && bottom < -containerOffsetHeight) {
          t.extra = t.extra - containerHeight - containerOffsetHeight;
        }
        if (direction === "down" && bottom > containerHeight + containerOffsetHeight) {
          t.extra = t.extra + containerHeight;
        }

        /* Scale from how far down the frame the tile currently is: full size
           at the bottom, smallest at the top, so it recedes as it climbs. */
        const top = t.position + t.top;
        const l = Math.max(0, Math.min(1, top / containerHeight));
        const want = CFG.scaleMin + l * (CFG.scaleMax - CFG.scaleMin);
        t.currentScale = lerp(t.currentScale, want, CFG.scaleEase);

        el.style.transform = `translate3d(0, ${t.position}px, ${p.z}px) scale(${t.currentScale})`;
      });

      last = current;
    };

    measure();
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      /* Taller than the hero and pulled up, exactly as the reference does, so
         tiles enter and leave well outside the visible frame. */
      className="pointer-events-none absolute left-0 z-0 w-full"
      style={{ top: "-25%", height: "150%", perspective: `${PERSPECTIVE}px` }}
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            tileRefs.current[i] = el;
          }}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: TILE,
            aspectRatio: "1 / 1",
            willChange: "transform",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-[#D9D9D9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTOS[i % PHOTOS.length]}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover object-center"
            />
          </div>
          {/* The paling sheet. Static per tile — it is a function of depth,
              which never changes, so it costs nothing per frame. */}
          <div
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: 1 - p.opacity }}
          />
        </div>
      ))}
    </div>
  );
}

export default function OurStoryHeroClient({
  data,
}: {
  data?: OurStoryHeroData | null;
}) {
  // Heading is fixed for this hero design. `data` is retained for future
  // Sanity wiring (images / quote) but is not used for layout.
  void data;

  const line1 = "Being Founder";
  const line2 = "Takes Guts";
  // TODO: replace with the real hero subtitle (placeholder copy for now).
  const description =
    "Built by founders, for founders — the story behind every conviction, every cheque, and every late-night call.";

  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
      style={{
        // White section starts at the very top so its background fills
        // behind the transparent navbar (nav strip matches the hero until
        // it turns blue on scroll). Content clears the nav via paddingTop.
        height: "78svh",
        paddingTop: "var(--nav-height)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{HERO_CSS}</style>

      <PhotoGalaxy />

      {/* ── HEADING + DESCRIPTION (centered, above the field) ── */}
      <div className="relative z-10 flex max-w-[760px] flex-col items-center text-center">
        <h1
          className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
          style={{
            ...HERO_HEADING_LIGHT_STYLE,
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s forwards",
          }}
        >
          {line1}
        </h1>

        <h1
          className={`m-0 text-[#0E0E0E] ${HERO_HEADING_LIGHT_CLASS}`}
          style={{
            ...HERO_HEADING_LIGHT_STYLE,
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.28s forwards",
          }}
        >
          {line2}
        </h1>

        <p
          className={`font-normal m-0 text-[#1a1a1a] ${HERO_BODY_CLASS}`}
          style={{
            ...HERO_BODY_STYLE,
            marginTop: "clamp(16px, min(2.5vw, 4vh), 36px)",
            opacity: 0,
            animation: "ourstory-rise 0.8s cubic-bezier(0.22,1,0.36,1) 0.46s forwards",
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
