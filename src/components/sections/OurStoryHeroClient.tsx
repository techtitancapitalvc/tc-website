"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { RevealLine } from "./BackedEarlyClient";
import {
  HERO_HEADING_DARK_CLASS,
  HERO_HEADING_DARK_STYLE,
  HERO_BODY_CLASS,
  HERO_BODY_STYLE,
} from "@/styles/heroTypography";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurStoryHero.tsx).
   ───────────────────────────────────────────────────────── */
export interface OurStoryHeroPhoto {
  url?: string;
  /** width / height, straight off the asset. 1 when Sanity can't report it. */
  aspect?: number;
}

export interface OurStoryHeroData {
  headingLineOne?: string;
  headingLineTwo?: string;
  description?: string;
  photos?: OurStoryHeroPhoto[];
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

/** Straight from the reference bundle, except `speed` — see below. */
const CFG = {
  /* The reference's own value is 0.15. Eased down a little: this field sits
     behind a heading people are meant to read, where the reference's is the
     whole page. Every other constant is left at the reference's number. */
  speed: 0.115,
  ease: 0.1,
  scaleEase: 0.25,
  scrollMultiplier: 0.05,
};

/**
 * HOW A TILE'S SIZE CHANGES ACROSS ITS TRAVEL — start of the climb to the end.
 *
 * A DELIBERATE DEPARTURE FROM THE REFERENCE, flagged because the rest of this
 * file is a port of it. The reference runs 1.4 down to 0.5, so its tiles
 * RECEDE as they rise. These GROW, 1x to 1.65x, which is the opposite
 * direction — worth knowing when the real bundle is ported, so this is not
 * mistaken for a mis-read of it.
 */
const SCALE_START = 1;
const SCALE_END = 1.65;
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

/**
 * SOME TILES ARE BIGGER. `BOOST` is a plain multiplier on the tile's width —
 * and because the tile carries `aspectRatio`, the height follows on its own,
 * so the picture is zoomed and never reshaped or cropped.
 *
 * It is a WIDTH, not a transform `scale`. The drift measures each tile's real
 * height to know when it has left the frame and must wrap; a scale applied in
 * the transform is invisible to that measurement (the ticker clears transforms
 * before measuring), so a scaled-up tile would wrap on its unscaled height and
 * pop out early. As a width it is genuine layout, and the ResizeObserver picks
 * it up like any other size.
 *
 * SEPARATE PRNG, seeded differently. Drawing these from the layout's own
 * generator would consume its sequence and shuffle every x/y after the first
 * boost — rearranging the whole field just to change some sizes.
 */
const BOOST = 1.25;
const BOOST_SHARE = 0.35;

const PARTICLES = (() => {
  const rand = mulberry32(0x5eed);
  const boostRand = mulberry32(0xb005);
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
      boost: boostRand() < BOOST_SHARE ? BOOST : 1,
    };
  });
})();

/** Copy used until the Sanity singleton is filled in. */
const FALLBACK_LINE_ONE = "Being Founder";
const FALLBACK_LINE_TWO = "Takes Guts";
const FALLBACK_DESCRIPTION =
  "Built by founders, for founders — the story behind every conviction, every cheque, and every late-night call.";

/** The built-in field, used until Sanity has photos of its own. These are
 *  square crops, hence aspect 1 — anything uploaded is shown at its own. */
const FALLBACK_PHOTOS: OurStoryHeroPhoto[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16,
].map((n) => ({ url: `/images/hero_founders_images/${n}.png`, aspect: 1 }));

/** 104px at the 1728 reference, down to 50px on a phone — the reference's own
 *  `w-[50px] md:w-[104px]`, expressed so it also responds to short screens.
 *
 *  THIS IS THE TILE'S WIDTH ONLY. Height comes from each photo's own aspect
 *  ratio, so a portrait shot is tall and a panorama is wide — nothing is
 *  cropped to a square. A tile's height is measured at runtime by the ticker
 *  (`getBoundingClientRect`), so mixed shapes wrap correctly without the
 *  drift maths needing to know anything about them. */
const TILE = "clamp(50px, min(6vw, 9vh), 104px)";
/** Guard rails so one extreme upload can't become a hairline or a skyscraper
 *  in the field. A 1:3 portrait and a 3:1 panorama both still read as photos. */
const ASPECT_MIN = 0.34;
const ASPECT_MAX = 3;

const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

/**
 * WHICH PHOTO GOES ON WHICH TILE.
 *
 * There are 32 tiles and usually far fewer photographs, so pictures repeat —
 * that is unavoidable. What is avoidable is two copies of the same face
 * sitting side by side, which is what `photos[i % photos.length]` produced:
 * that walks the list in order with no idea where the tiles are, so whether a
 * repeat lands next to itself is pure luck of the seeded layout.
 *
 * This places them deliberately instead. Walking the tiles, each one takes the
 * photo that is (a) least used so far, so the set stays evenly spread, and
 * (b) among those, the one sitting FURTHEST HORIZONTALLY FROM ITS NEAREST
 * EXISTING COPY.
 *
 * "Nearest existing copy" — every placement, not just the most recent one —
 * is the part that actually works. Scoring against only the last placement
 * barely helped (minimum gap 1% -> 5% across 15 photos, 6 close pairs down to
 * 2), because a photo already on the field several times was being judged on
 * one of them and dropped straight next to another. Measuring against all of
 * them takes the same 15 photos to a 15% minimum gap and NO pair closer than
 * 12% of the field's width.
 *
 * Distance is capped at SPREAD_ENOUGH so the tie-break stops chasing ever
 * larger gaps once a pair is comfortably apart — past that the choice is made
 * on usage, which keeps the distribution even. 45 measures better than an
 * uncapped span at middling photo counts.
 *
 * WITH VERY FEW PHOTOS THE GEOMETRY WINS. Three photos over 32 tiles is
 * eleven copies each across the field; they cannot all be far apart, and no
 * assignment fixes that. More photos in Sanity is the only real answer, and
 * the fallback set of 15 is already comfortably past it.
 */
const SPREAD_ENOUGH = 45;

function assignPhotos(
  particles: { x: number }[],
  photoCount: number
): number[] {
  if (photoCount <= 0) return particles.map(() => 0);
  const uses = new Array(photoCount).fill(0);
  const placedX: number[][] = Array.from({ length: photoCount }, () => []);

  return particles.map((p) => {
    let best = 0;
    let bestScore = -Infinity;
    for (let j = 0; j < photoCount; j++) {
      let gap = SPREAD_ENOUGH; // unused photo — as good as far away
      for (const x of placedX[j]) gap = Math.min(gap, Math.abs(p.x - x));
      // Usage dominates; horizontal clearance breaks the tie.
      const score = -uses[j] * 1000 + gap;
      if (score > bestScore) {
        bestScore = score;
        best = j;
      }
    }
    uses[best] += 1;
    placedX[best].push(p.x);
    return best;
  });
}

const HERO_CSS = `
@keyframes ourstory-rise {
  0%   { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

/**
 * Gap between words on a heading line.
 *
 * IT HAS TO STAND IN FOR A REAL SPACE, in `em` so it tracks the font size.
 * Splitting the heading into one RevealLine per word throws the actual space
 * characters away — inside a RevealLine a space is rendered as a glyph
 * (`" "`), but between two of them there is nothing at all, and the gap is
 * the only thing holding the words apart.
 *
 * HeroClient's `min(0.8vw, 1.4vh)` is the wrong value to borrow here: there it
 * separates three whole elements on one line, while its own words live inside a
 * single RevealLine and keep their real spaces. Measured against this font, it
 * came to 0.093em against a real space of 0.17em — a bit over half — so the
 * words read as run together. 0.2em sits just wider than a true space, which
 * suits a display heading.
 */
const WORD_GAP = "0.2em";

function PhotoGalaxy({ photos }: { photos: OurStoryHeroPhoto[] }) {
  /* Depends only on how many photos there are — the tile layout is a module
     constant — so this is computed once per photo count, not per frame. */
  const assignment = useMemo(
    () => assignPhotos(PARTICLES, photos.length),
    [photos.length]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* The white veils, driven per frame alongside the tiles — see the note where
     they are rendered. */
  const veilRefs = useRef<(HTMLDivElement | null)[]>([]);
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

        /* SCALE ACROSS THE TILE'S TRAVEL — it GROWS as it climbs.
           `l` is how far down the frame the tile sits: 1 at the bottom where it
           enters, 0 at the top where it leaves. `travel` flips that into 0 at
           the start of the journey and 1 at the end, so the two constants read
           in the order they happen.

           Eased, not linear: `1 - (1 - travel)^2` puts most of the growth in
           the first part of the climb and settles as the tile approaches the
           top, which is the "grows quickly from the start point" the design
           asks for. Linear made the change hard to notice until half way up. */
        const top = t.position + t.top;
        const l = Math.max(0, Math.min(1, top / containerHeight));
        const travel = 1 - l;
        const eased = 1 - (1 - travel) * (1 - travel);
        const want = SCALE_START + eased * (SCALE_END - SCALE_START);
        t.currentScale = lerp(t.currentScale, want, CFG.scaleEase);

        el.style.transform = `translate3d(0, ${t.position}px, ${p.z}px) scale(${t.currentScale})`;

        /* The veil clears on the same eased curve the tile grows on: a tile
           that enters pale brightens quickly at first, and is fully opaque by
           the time it reaches the top. A tile with no paleness to start with
           (z >= 0) has a base of 0 and is unaffected. */
        const veil = veilRefs.current[n];
        if (veil) {
          veil.style.opacity = ((1 - p.opacity) * (1 - eased)).toFixed(3);
        }
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
      {PARTICLES.map((p, i) => {
        const photo = photos[assignment[i]];
        /* The tile is cut to the picture. `object-contain` rather than `cover`
           so nothing is trimmed even if the reported aspect and the file ever
           disagree — with the box already at the right shape there are no bars
           to show. */
        const aspect = Math.min(
          ASPECT_MAX,
          Math.max(ASPECT_MIN, Number(photo?.aspect) || 1)
        );
        return (
        <div
          key={i}
          ref={(el) => {
            tileRefs.current[i] = el;
          }}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.boost === 1 ? TILE : `calc(${TILE} * ${p.boost})`,
            aspectRatio: `${aspect}`,
            willChange: "transform",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-[#D9D9D9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo?.url}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-contain object-center"
            />
          </div>
          {/* THE PALING SHEET — a white veil over the photograph, and it now
              CLEARS AS THE TILE TRAVELS.

              It used to be static: a function of the tile's `z`, which never
              changes, so a deep tile stayed washed out for its whole life and
              simply looked like a faded photo. It is driven per frame by the
              ticker instead, from the same eased travel that grows the tile —
              so the ones that enter faintest are the ones that gain the most,
              and every tile is fully opaque by the time it leaves the top.

              The inline value is the tile's starting paleness, so the first
              painted frame is right before the ticker has run. */}
          <div
            ref={(el) => {
              veilRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: 1 - p.opacity }}
          />
        </div>
        );
      })}
    </div>
  );
}

export default function OurStoryHeroClient({
  data,
}: {
  data?: OurStoryHeroData | null;
}) {
  /* The drifting field comes from Sanity when it has been filled in, and from
     the built-in set otherwise, so the hero is never empty mid-migration. */
  const photos = data?.photos?.length
    ? data.photos.filter((p) => p?.url)
    : FALLBACK_PHOTOS;

  /* Sanity first, the constants below only as a fallback — so the hero still
     reads properly before the singleton is created, and follows the CMS the
     moment it is. */
  const line1 = data?.headingLineOne || FALLBACK_LINE_ONE;
  const line2 = data?.headingLineTwo ?? FALLBACK_LINE_TWO;
  const description = data?.description || FALLBACK_DESCRIPTION;

  /* The per-character reveal runs once the component is on the client. This
     hero sits at the very top of the page, so mount is the right trigger —
     there is no scrolling to it. */
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);


  return (
    <section
      /* FULL SCREEN, the same way HeroClient is: `h-screen` with a `100dvh`
         override under `md`, because mobile browser chrome makes `vh` taller
         than the visible area and the hero would be cut off by the URL bar. */
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-white max-md:!h-[100dvh]"
      style={{
        // White section starts at the very top so its background fills
        // behind the transparent navbar (nav strip matches the hero until
        // it turns blue on scroll). Content clears the nav via paddingTop.
        paddingTop: "var(--nav-height)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <style>{HERO_CSS}</style>

      <PhotoGalaxy photos={photos.length ? photos : FALLBACK_PHOTOS} />

      {/* ── HEADING + DESCRIPTION (centered, above the field) ──
          THE COLUMN IS FULL WIDTH, the description narrow inside it. At level 2
          the whole block fitted in 760px; at level 1 "BEING FOUNDER" alone
          needs about 1370px, so that cap broke each line into two and the
          heading set in four lines instead of two. Width belongs to the
          heading, measure belongs to the description — so the cap moved down
          onto the paragraph, which is the only part that wants it. */}
      <div className="relative z-10 flex w-full flex-col items-center text-center">
        {/* ── HEADING ──
            HeroClient's treatment, at HeroClient's size: level 1 exactly as the
            shared token defines it, black here rather than white because the
            level is the type scale and the colour belongs to the section.
            NOTHING RESIZES IT — no fitted or derived size of its own.

            THE REVEAL UNIT IS A WORD, not a whole line, and that is what lets
            it wrap. RevealLine sets `whitespace-nowrap` on whatever it is given
            (it must, or characters reflow mid-animation), so handing it a full
            line made that line unbreakable — at level 1 a long one ran off both
            edges and the section's `overflow-hidden` hid the ends. Per word,
            each word stays intact while the line breaks between words, so a
            heading that will not fit in two lines simply sets in three.

            ROW GAP is the line spacing: level 1's 86% line-height is tighter
            than the glyphs, so stacked lines touch at 0px. `0.12em` opens them
            and tracks the font size — the same fix BackedEarly's and
            FoundersStory's headings carry. WORD_GAP is HeroClient's own
            word spacing. */}
        <h1
          className={`m-0 flex w-full flex-col items-center text-center text-[#0E0E0E] ${HERO_HEADING_DARK_CLASS}`}
          style={{ ...HERO_HEADING_DARK_STYLE, rowGap: "0.12em" }}
        >
          {[line1, line2].filter(Boolean).map((line, li) => {
            /* Words keep revealing in reading order across both lines, so the
               cascade does not restart half way down the heading. */
            const before = li === 0 ? 0 : (line1 ?? "").trim().split(/\s+/).length;
            return (
              <span
                key={li}
                className="flex flex-wrap items-baseline justify-center"
                style={{ columnGap: WORD_GAP, rowGap: "0.12em" }}
              >
                {(line as string)
                  .trim()
                  .split(/\s+/)
                  .map((word, wi) => (
                    <RevealLine
                      key={`${li}-${wi}`}
                      show={show}
                      delay={(before + wi) * 0.09}
                    >
                      {word}
                    </RevealLine>
                  ))}
              </span>
            );
          })}
        </h1>

        <p
          className={`font-normal m-0 max-w-[760px] text-[#1a1a1a] ${HERO_BODY_CLASS}`}
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
