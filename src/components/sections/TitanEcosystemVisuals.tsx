"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The four diagrams on the /titanEcosystem rail.
 *
 * They live apart from the section so that file stays about LAYOUT — the
 * scroll line, the pointer, the alternating columns — and this one is only
 * about drawing. Pick one with `<PartVisual kind="…" />`.
 *
 *   orbit      six satellites breathing in and out around a dashed ring
 *   mandala    three rings of nodes that turn and breathe through each other
 *   web        a spider crawling a dot field, spinning threads to the nearest
 *   monogram   a letter cloud that turns once in 3D, then scrambles into a
 *              dot-matrix "TC" with a field band above and below
 *
 * THREE ENGINES, each for a reason:
 *
 *   CSS keyframes   the orbit and the star. They loop forever with no input,
 *                   so they should keep going whether or not React renders.
 *   rAF + refs      the spider. Its body moves every frame and its threads are
 *                   `x1`/`y1`/`x2`/`y2` — SVG attributes CSS cannot animate.
 *                   Writing them through refs avoids re-rendering fifty-odd
 *                   static dots sixty times a second to move nine lines.
 *   Canvas          the monogram, because a couple of thousand particles is
 *                   far past what the DOM will animate. See its own note.
 *
 * NOTHING STARTS UNTIL IT IS SEEN. Every visual is wrapped by PartVisual in an
 * observed element: the CSS ones are paused through `animation-play-state`,
 * and the two rAF loops check the same flag themselves.
 *
 * DETERMINISM. Anything rendered on the server — the SVG dot field, the
 * triangle's vertices — is hand-picked, never Math.random, because a random
 * value chosen during render differs between server and client and React would
 * report a hydration mismatch. The canvas is exempt: it builds its particles
 * inside an effect, which only ever runs on the client.
 */

/* ─────────────────────────────────────────────────────────
   Shared geometry. Sizes are `min(vw, vh)` against the
   1728x1117 reference so they shrink on narrow AND short
   screens, then clamp at both ends.
   ───────────────────────────────────────────────────────── */
export const VISUAL_SIZE = "clamp(220px, min(26vw, 40vh), 440px)";
/** The mandala runs larger — see the note on its wrapper. */
const MANDALA_SIZE = "clamp(280px, min(40vw, 60vh), 660px)";
const ORBIT_DOT = "clamp(26px, min(3.24vw, 5.01vh), 56px)";

/** Dash pattern for every dashed path here, in SCREEN px — see the
 *  non-scaling-stroke note on the orbit ring for why the unit is pixels. */
const DASH = "26 16";

const SPIN_SECONDS = 20;
const PULSE_SECONDS = 11;

const EASE_CSS = "cubic-bezier(0.22,1,0.36,1)";
/** Symmetric, for anything that expands and then contracts — the house
 *  ease-out front-loads and would make a collapse land in a few percent. */
const EASE_BREATHE = "cubic-bezier(0.45,0,0.55,1)";

const STROKE = "rgba(255,255,255,0.45)";
/** Mandala. Edges are faint on purpose — they only read where they overlap,
 *  which is what gives the reference its woven look. */
const MANDALA_EDGE = "rgba(255,255,255,0.13)";
const MANDALA_NODE_FILL = "rgba(255,255,255,0.92)";
/** The spider. The reference is red on black; on this navy that would read as
 *  an error state, so it takes the section's own light blue instead. */
const SPIDER_BODY = "rgba(210,230,255,0.95)";
const SPIDER_THREAD = "rgba(150,190,255,0.8)";

export type VisualKind = "orbit" | "mandala" | "web" | "monogram";

/* ═════════════════════════════════════════════════════════
   KEYFRAMES — injected once by the section.
   ═════════════════════════════════════════════════════════ */
export const VISUAL_KEYFRAMES = (ring: string) => `
@property --orbit-r {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

@keyframes eco-spin { to { transform: rotate(360deg); } }
@keyframes eco-spin-slow { to { transform: rotate(360deg); } }
@keyframes eco-spin-back { to { transform: rotate(-360deg); } }

/* ── ORBIT ── */
@keyframes eco-radius {
  0%   { --orbit-r: calc(0.232 * ${ring}); }
  30%  { --orbit-r: calc(0.400 * ${ring}); }
  52%  { --orbit-r: calc(0.400 * ${ring}); }
  70%  { --orbit-r: calc(0.130 * ${ring}); }
  82%  { --orbit-r: calc(0.130 * ${ring}); }
  100% { --orbit-r: calc(0.232 * ${ring}); }
}
@keyframes eco-ring {
  0%   { opacity: 0.85; }
  30%  { opacity: 1; }
  52%  { opacity: 1; }
  70%  { opacity: 0.4; }
  82%  { opacity: 0.4; }
  100% { opacity: 0.85; }
}
@keyframes eco-sat {
  0%   { opacity: 1; }
  52%  { opacity: 1; }
  66%  { opacity: 0; }
  82%  { opacity: 0; }
  94%  { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes eco-core {
  0%   { opacity: 0; transform: scale(0.3); }
  56%  { opacity: 0; transform: scale(0.3); }
  70%  { opacity: 1; transform: scale(1); }
  82%  { opacity: 1; transform: scale(1); }
  92%  { opacity: 0; transform: scale(0.3); }
  100% { opacity: 0; transform: scale(0.3); }
}

/* NOTHING RUNS UNTIL THE READER GETS THERE.
   Every visual is wrapped in [data-eco-visual], and until its observer reports
   it on screen the wrapper is "idle" and every animation inside is paused.
   Without this, all four start on mount: by the time the last part on the rail
   is scrolled to, its orbit has been cycling unseen for a minute and is caught
   mid-collapse. PAUSING rather than never-starting is deliberate — a visual
   scrolled away and back resumes where it was instead of snapping to 0%.

   The spider and the monogram are canvas/rAF rather than CSS, so this rule
   cannot reach them; each gates its own loop on the same observer. */
[data-eco-visual="idle"],
[data-eco-visual="idle"] * {
  animation-play-state: paused !important;
}
`;

/* ═════════════════════════════════════════════════════════
   1. ORBIT
   ═════════════════════════════════════════════════════════ */
const ORBIT_COUNT = 6;
const STEP_DEG = 360 / ORBIT_COUNT;

function Orbit() {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: VISUAL_SIZE,
        height: VISUAL_SIZE,
        animation: `eco-radius ${PULSE_SECONDS}s ${EASE_BREATHE} infinite`,
      }}
      aria-hidden
    >
      {/* THE ORBIT PATH. Its diameter is literally `2 x --orbit-r` — the same
          variable each satellite rides out along — so the circles sit exactly
          ON it at every frame, not just when expanded.

          `vector-effect="non-scaling-stroke"` holds the 1px width and the dash
          pattern in SCREEN pixels. Without it both live in viewBox units and
          would scale with the ring, stretching as it expands and collapsing to
          specks at the small radius.

          r="50" against a 100-unit viewBox makes the drawn radius exactly
          `--orbit-r`; the stroke then straddles the viewBox edge, so the
          `overflow: visible` is load-bearing. */}
      <svg
        viewBox="0 0 100 100"
        className="absolute left-1/2 top-1/2"
        style={{
          width: "calc(2 * var(--orbit-r))",
          height: "calc(2 * var(--orbit-r))",
          marginLeft: "calc(-1 * var(--orbit-r))",
          marginTop: "calc(-1 * var(--orbit-r))",
          overflow: "visible",
          animation: `eco-ring ${PULSE_SECONDS}s ${EASE_BREATHE} infinite`,
          willChange: "opacity",
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="50"
          fill="none"
          stroke={STROKE}
          strokeWidth="1"
          strokeDasharray={DASH}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          animation: `eco-spin ${SPIN_SECONDS}s linear infinite`,
          willChange: "transform",
        }}
      >
        {Array.from({ length: ORBIT_COUNT }, (_, slot) => (
          /* ANGLE and RADIUS cannot share an element: a later `transform`
             replaces an earlier one rather than adding to it. */
          <div
            key={slot}
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ transform: `rotate(${slot * STEP_DEG}deg)` }}
          >
            <div
              className="relative"
              style={{ transform: "translateY(calc(-1 * var(--orbit-r)))" }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: ORBIT_DOT,
                  height: ORBIT_DOT,
                  marginLeft: `calc(-0.5 * ${ORBIT_DOT})`,
                  marginTop: `calc(-0.5 * ${ORBIT_DOT})`,
                  border: "1px solid rgba(255,255,255,0.7)",
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(120,170,255,0.14) 0%, transparent 72%)",
                  boxShadow: "0 0 18px rgba(120,170,255,0.22)",
                  animation: `eco-sat ${PULSE_SECONDS}s ${EASE_CSS} infinite`,
                  willChange: "opacity",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: ORBIT_DOT,
          height: ORBIT_DOT,
          marginLeft: `calc(-0.5 * ${ORBIT_DOT})`,
          marginTop: `calc(-0.5 * ${ORBIT_DOT})`,
          background:
            "radial-gradient(circle at 50% 50%, #FFFFFF 0%, rgba(196,220,255,0.95) 62%, rgba(130,175,255,0.8) 100%)",
          boxShadow: "0 0 26px rgba(150,190,255,0.55)",
          animation: `eco-core ${PULSE_SECONDS}s ${EASE_CSS} infinite`,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   2. MANDALA — three rings that breathe through each other
   ═════════════════════════════════════════════════════════ */
/**
 * Rebuilt from the reference GIF rather than by eye: the file was pulled down
 * and all 53 frames measured, so every number below comes from the source.
 *
 * THE RINGS SWAP — they do not bounce. This is the thing that is easy to get
 * wrong, because the radii alone cannot tell you which it is: both models
 * produce the identical sequence of radius values. The angular offsets settle
 * it. Each ring carries a fixed offset (they sit 40/3 deg apart, one third of
 * the 40 deg node pitch), and those offsets TRADE PLACES across a merge:
 *
 *     frame 44   measured        [24.27, 37.48, 11.14]
 *                if they bounced [37.49, 11.12, 24.35]
 *
 * — a cyclic rotation of the baseline, not a return to it. So every ring
 * travels outward, and the outermost comes back round as the new innermost.
 *
 * That makes the whole thing ONE closed radius path with three rings spaced a
 * third of a period apart, rather than three rings each with their own range.
 * Fitted against the measured frames, within 3.5% of the half-size:
 *
 *     r(p) = 0.5 + 0.25 * cos(2pi * (p - 0.56))     (as a fraction of half)
 *
 * The merges fall out of it for free: rings a third of a period apart cross
 * at exactly the 50/125/125 and 75/75/150 the GIF measures.
 *
 * ROTATION IS NOT SEPARATE. Each ring also advances 40 deg — exactly one node
 * pitch — per period, so after one period every ring has moved up a role AND
 * turned by one node, and the figure is pixel-identical. That is why the
 * source GIF can loop in a third of the true period.
 *
 * Node radius tracks its ring radius (measured 2.7 / 5.8 / 9.1px at radii
 * 56.7 / 100 / 143.3), so a node grows as it travels outward.
 */
const MANDALA_RINGS = 3;
const MANDALA_NODES = 9;
/**
 * Seconds for one full period — every ring back to where it began.
 *
 * The GIF measures 6.36s. Slowed here: the reference is a standalone loop you
 * look AT, this one sits beside body copy and has to be readable past. One
 * merge happens every PERIOD/3, so this is a merge every 3s.
 */
const MANDALA_PERIOD = 9;
/** Where in the period the rings are at their widest. */
const MANDALA_PEAK = 0.56;
/** Ring radius as a fraction of the half-size: mid, and swing either side. */
const MANDALA_MID = 0.5;
const MANDALA_SWING = 0.25;
/** Node radius as a fraction of its own ring radius. */
const MANDALA_NODE = 0.06;
/**
 * How much of the canvas the figure fills.
 *
 * The measured fractions above come straight from the GIF, where the rings
 * peak at 0.75 of the half-size — so with a node on top the drawing only ever
 * reached 79% of its box and sat in a pool of empty space. Scaling by one
 * factor keeps the reference's proportions exactly while taking it to 95%.
 */
const MANDALA_FIT =
  0.95 / ((MANDALA_MID + MANDALA_SWING) * (1 + MANDALA_NODE));

function Mandala() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    const start = performance.now();

    const size = () => {
      // Layout box, not getBoundingClientRect — the cell carries an entrance
      // scale, and the rect would bake it into the backing store.
      w = Math.max(1, wrap.offsetWidth);
      h = Math.max(1, wrap.offsetHeight);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const half = Math.min(w, h) / 2;
      // 0 at one end of the breathe, 1 at the other. Cosine, so it eases into
      // each merge instead of arriving at constant speed.
      /* Each ring is the SAME path, a third of a period apart. They are left
         in index order deliberately — see the edge note below for why sorting
         them by radius is exactly what must not happen. */
      const base = reduced ? 0.25 : t / MANDALA_PERIOD;
      const rings = Array.from({ length: MANDALA_RINGS }, (_, k) => {
        const p = (base + k / MANDALA_RINGS) % 1;
        const frac =
          MANDALA_MID + MANDALA_SWING * Math.cos(2 * Math.PI * (p - MANDALA_PEAK));
        const radius = frac * MANDALA_FIT * half;
        /* One node pitch per period. This is the entire rotation — there is no
           separate spin — and it is what makes the period seamless: a ring
           that has moved up a role has also turned by exactly one node. */
        const offset = (p * (2 * Math.PI)) / MANDALA_NODES;
        return {
          radius,
          dot: radius * MANDALA_NODE,
          pts: Array.from({ length: MANDALA_NODES }, (_, i) => {
            const a = offset + (i / MANDALA_NODES) * Math.PI * 2;
            return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
          }),
        };
      });

      /* EDGES — wired by ring IDENTITY, never by current radius order.
         This is what stops them flickering. The rings genuinely change places,
         so "the ring outside this one" is a different ring before and after
         every merge; connecting on that basis makes the whole spoke set jump
         to different nodes the instant two rings cross. Joining every ring to
         every other one is immune to it — the pairs are the same pairs no
         matter who is currently where, so the lines only ever move as fast as
         the nodes do.

         Drawn before the nodes so the dots sit on top, and all in one path:
         one stroke of a hundred-odd hairlines is far cheaper than a hundred
         strokes, and it lets overlaps build brightness the way the reference
         does. */
      ctx.strokeStyle = MANDALA_EDGE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      rings.forEach((ring, a) => {
        // Within the ring: the polygon, plus a skip-one chord for density.
        ring.pts.forEach((p, i) => {
          for (const step of [1, 2]) {
            const q = ring.pts[(i + step) % MANDALA_NODES];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        });
        // To every other ring: two spokes per node, which is what fans the star.
        for (let b = a + 1; b < rings.length; b++) {
          const other = rings[b];
          ring.pts.forEach((p, i) => {
            for (const step of [0, 1]) {
              const q = other.pts[(i + step) % MANDALA_NODES];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
            }
          });
        }
      });
      ctx.stroke();

      // Nodes.
      ctx.fillStyle = MANDALA_NODE_FILL;
      rings.forEach((ring) => {
        ring.pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, ring.dot, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    };

    size();
    raf = requestAnimationFrame(draw);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(wrap);
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      /* Larger than the orbit's VISUAL_SIZE: this figure is a ring of rings
         rather than a single circle, so at 440px its detail closed up. Capped
         at 100% of the cell, and centred in it by the flex wrapper. */
      className="relative w-full"
      style={{ maxWidth: MANDALA_SIZE, aspectRatio: "1" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   3. SPIDER WEB
   ═════════════════════════════════════════════════════════ */
/**
 * THE FIELD the spider crawls through. A static scatter of faint dots in
 * viewBox units — hand-placed rather than generated, per the determinism note
 * at the top. The spider is what moves; these never do.
 */
const WEB_DOTS: [number, number][] = [
  [6, 9], [19, 4], [33, 12], [47, 6], [58, 14], [71, 5], [84, 11], [95, 7],
  [11, 22], [25, 17], [38, 26], [52, 20], [64, 28], [78, 19], [90, 25],
  [4, 36], [17, 32], [30, 41], [44, 34], [56, 43], [69, 33], [82, 39], [96, 31],
  [9, 51], [22, 46], [35, 55], [48, 49], [61, 57], [74, 47], [87, 53],
  [3, 65], [16, 61], [29, 69], [42, 63], [55, 71], [68, 62], [80, 67], [93, 60],
  [12, 79], [26, 75], [39, 84], [51, 77], [63, 86], [76, 78], [89, 82],
  [7, 92], [21, 96], [34, 90], [46, 97], [59, 91], [72, 95], [85, 93], [97, 88],
  /* Second pass, interleaved with the first. The field is stretched across a
     168-unit viewBox, so the original 53 dots covered 1.68x the area at 1.68x
     the spacing and read as empty. These bring the spacing back. */
  [13, 14], [27, 8], [41, 19], [54, 3], [67, 21], [80, 2], [92, 17],
  [2, 27], [20, 30], [33, 22], [45, 29], [58, 35], [71, 26], [85, 32], [98, 21],
  [10, 44], [24, 38], [37, 47], [50, 40], [63, 50], [77, 41], [90, 46],
  [6, 58], [19, 54], [32, 62], [45, 56], [58, 64], [70, 55], [84, 60], [95, 52],
  [14, 71], [28, 66], [40, 74], [53, 68], [66, 77], [79, 70], [91, 73],
  [4, 84], [17, 88], [30, 82], [43, 89], [56, 83], [69, 87], [82, 85], [94, 79],
];
/**
 * The field is WIDER THAN IT IS TALL, matching the copy column beside it, so
 * the viewBox has to widen too. A square `0 0 100 100` viewBox in a landscape
 * box letterboxes: `preserveAspectRatio` defaults to "meet", which would leave
 * the dots huddled in a square in the middle with empty gutters either side.
 * Stretching instead (`none`) would squash the dots into ovals. Widening the
 * viewBox is the only option that keeps circles round AND fills the box.
 *
 * The stored dot coordinates stay 0-100 and are scaled across on the way out,
 * so the hand-placed field above did not have to be re-authored.
 */
const WEB_VB_W = 168;
const WEB_X = WEB_VB_W / 100;
/** How many threads the spider holds at once. */
const SPIDER_LEGS = 9;
/** How far a thread will stretch, in viewBox units. */
const SPIDER_REACH = 34;
/** Fraction of the remaining distance the body covers each frame — the lag
 *  that makes it crawl toward the pointer rather than teleport. */
const SPIDER_EASE = 0.055;

/**
 * A spider crawling through a field of dots, spinning a thread to each of the
 * nearest few. It follows the pointer, and wanders a slow figure-of-eight on
 * its own when there is none, so the visual is alive before it is touched.
 *
 * THE LEGS ARE RE-CHOSEN EVERY FRAME. They are not fixed spokes: as the body
 * moves, whichever dots are now nearest take the threads and the previous ones
 * are released. That re-attachment is the whole effect.
 *
 * Driven through refs on an rAF loop, not React state. The body moves every
 * frame, and re-rendering fifty-odd dots at 60fps to move nine lines is work
 * for nothing — the field is built once and never touched again.
 */
/** The field in viewBox coordinates — scaled across the wider box once. */
const WEB_FIELD: [number, number][] = WEB_DOTS.map(([x, y]) => [x * WEB_X, y]);

function SpiderWeb() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGRectElement>(null);
  const legRefs = useRef<(SVGLineElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let bx = WEB_VB_W / 2;
    let by = 50;
    let raf = 0;
    const start = performance.now();

    /* The CSS pause rule cannot reach an rAF loop, so this one gates itself on
       the same observer: off screen, the frame is still requested but does no
       work. Crawling a spider nobody can see is pure battery. */
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );
    io.observe(svg);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = (now - start) / 1000;

      /* Target: the pointer, or a slow wander when it is away. The two curves
         have different periods so the path never repeats tightly. */
      const p = pointer.current;
      const tx = p ? p.x : WEB_VB_W / 2 + Math.sin(t * 0.31) * (WEB_VB_W * 0.32);
      const ty = p ? p.y : 50 + Math.sin(t * 0.23 + 1.1) * 26;

      if (reduced) {
        bx = tx;
        by = ty;
      } else {
        bx += (tx - bx) * SPIDER_EASE;
        by += (ty - by) * SPIDER_EASE;
      }

      const body = bodyRef.current;
      if (body) {
        body.setAttribute("x", (bx - 1.6).toFixed(2));
        body.setAttribute("y", (by - 1.6).toFixed(2));
      }

      // Nearest dots win the threads, recomputed from scratch each frame.
      const near = WEB_FIELD.map(([x, y]) => ({
        x,
        y,
        d: Math.hypot(x - bx, y - by),
      }))
        .sort((a, b) => a.d - b.d)
        .slice(0, SPIDER_LEGS);

      for (let i = 0; i < SPIDER_LEGS; i++) {
        const line = legRefs.current[i];
        if (!line) continue;
        const n = near[i];
        if (!n || n.d > SPIDER_REACH) {
          line.setAttribute("opacity", "0");
          continue;
        }
        line.setAttribute("x1", bx.toFixed(2));
        line.setAttribute("y1", by.toFixed(2));
        line.setAttribute("x2", n.x.toFixed(2));
        line.setAttribute("y2", n.y.toFixed(2));
        // Fades as a thread reaches its limit, so legs let go softly.
        line.setAttribute("opacity", (1 - n.d / SPIDER_REACH).toFixed(3));
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      /* Full column width, matching the copy in the other half. */
      className="relative w-full"
      style={{ aspectRatio: String(WEB_VB_W / 100) }}
      aria-hidden
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WEB_VB_W} 100`}
        className="h-full w-full"
        style={{ overflow: "visible" }}
        onPointerMove={(e) => {
          const b = svgRef.current?.getBoundingClientRect();
          if (!b) return;
          pointer.current = {
            x: ((e.clientX - b.left) / b.width) * WEB_VB_W,
            y: ((e.clientY - b.top) / b.height) * 100,
          };
        }}
        onPointerLeave={() => {
          pointer.current = null;
        }}
      >
        {/* The field. Built once — the loop above never touches these. */}
        {WEB_FIELD.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.5" fill="rgba(255,255,255,0.45)" />
        ))}

        {/* Threads. Positioned entirely by the loop. */}
        {Array.from({ length: SPIDER_LEGS }, (_, i) => (
          <line
            key={i}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
            stroke={SPIDER_THREAD}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0"
          />
        ))}

        {/* The body — a small square, as in the reference. */}
        <rect
          ref={bodyRef}
          width="3.2"
          height="3.2"
          fill={SPIDER_BODY}
          style={{ filter: "drop-shadow(0 0 6px rgba(150,190,255,0.7))" }}
        />
      </svg>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   4. "TC" MONOGRAM — a letter cloud that turns, then settles
   ═════════════════════════════════════════════════════════ */
/**
 * WHY THIS ONE IS A CANVAS AND THE OTHER THREE ARE NOT.
 *
 * The brief is thousands of letters flying in and settling into the wordmark.
 * At that count the DOM stops being an option: ~2,000 absolutely-positioned
 * elements, each with its own transform, is thousands of layout boxes and
 * composited layers to update every frame. One canvas is a single element and
 * one draw call per particle, and it does not touch layout at all.
 *
 * The letters are pre-rendered ONCE into small sprite canvases, one per
 * distinct character, and then blitted with drawImage. Calling fillText per
 * particle per frame would re-shape and re-rasterise the glyph 2,000 times a
 * frame, which is the difference between this running at 60fps and not.
 *
 * TARGETS COME FROM THE SHAPE ITSELF. "TC" is drawn to an offscreen canvas and
 * its pixels sampled on a grid; every opaque pixel becomes a home for one
 * particle. So the wordmark is never hard-coded as coordinates — change the
 * text or the font and the target cloud follows.
 */
/** The alphabet the flying particles are drawn from. */
const MONO_ALPHABET = "TITANCAPITAL";
/**
 * THE WORDMARK, drawn on the grid. A monoline "TC" one cell thick: a
 * nine-wide crossbar over a centred stem, and a C open on the right.
 *
 * Authored, not sampled from a font — see the note in `build` for why sampling
 * cannot make this shape. Editing this array is how you change the mark: every
 * "1" becomes one letter, and the grid re-centres itself.
 */
const TC_GRID = [
  "1111111110011110",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000100000",
  "0000100000011110",
];
/** Columns in the field. Wider than the wordmark, so the bands run past it. */
const MONO_FIELD_COLS = 22;
/** Full-width rows of dimmer letters above and below the wordmark. */
const MONO_BANDS = 2;
/** Letter size as a share of the cell pitch. Below ~0.4 the grid reads empty. */
const MONO_GLYPH_RATIO = 0.52;
/** Opacity of a band letter against a wordmark letter. */
const MONO_DIM = 0.4;
/** Hard cap, so a very large viewport cannot melt a laptop. */
const MONO_MAX = 2600;
/** Seconds for ONE full revolution of the letter cloud, before it scrambles. */
const MONO_SPIN = 3.6;
/** Seconds for the scramble into the wordmark. */
const MONO_FLIGHT = 2.4;
/** Camera distance for the 3D projection. Smaller = more dramatic depth. */
const MONO_FOCAL = 620;
/** Pointer influence radius and peak push, in CSS px. */
const MONO_REACH = 120;
const MONO_PUSH = 34;

type Particle = {
  /** where it settles — sampled from the wordmark */
  hx: number;
  hy: number;
  /** its seat in the rotating cloud, as a real 3D point */
  ax: number;
  ay: number;
  az: number;
  /** sprite index, and its own stagger into the scramble */
  ch: number;
  delay: number;
  /** true for the band letters, which sit back from the wordmark */
  dim: boolean;
  /** idle drift, once home */
  px: number;
  py: number;
  ps: number;
};

/** Symmetric, for the scramble: it should leave the spin gently and arrive
 *  gently, where an ease-out would snap away from the cloud. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function Monogram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Pointer in CSS px relative to the canvas; null when it is away. */
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let sprites: HTMLCanvasElement[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let startedAt: number | null = null;

    /** One small canvas per distinct character, rendered once. */
    const buildSprites = (size: number) => {
      const chars = [...new Set(MONO_ALPHABET.split(""))];
      return chars.map((ch) => {
        const c = document.createElement("canvas");
        const dpr = window.devicePixelRatio || 1;
        c.width = Math.ceil(size * dpr);
        c.height = Math.ceil(size * dpr);
        const cx = c.getContext("2d");
        if (cx) {
          cx.scale(dpr, dpr);
          cx.font = `600 ${size * 0.9}px Poppins, sans-serif`;
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.fillStyle = "rgba(214,232,255,0.92)";
          cx.fillText(ch, size / 2, size / 2);
        }
        return c;
      });
    };

    /** Sample the wordmark and hand every opaque pixel to a particle. */
    const build = () => {
      /* offsetWidth/Height, NOT getBoundingClientRect. The rect includes every
         ancestor transform, and this canvas sits inside a cell that animates
         `scale: 0.9 -> 1` on entrance and `1 -> 1.06` on hover. Sizing off the
         rect captures whatever scale happened to be mid-flight — measured 259px
         against a real 440px box — and the backing store is then stretched by
         CSS to fill it: a blurry wordmark, and particle coordinates that do not
         match the pixels they were sampled from. offsetWidth is the layout box
         and is immune to all of it. */
      w = Math.max(1, wrap.offsetWidth);
      h = Math.max(1, wrap.offsetHeight);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* ONE GRID FOR EVERYTHING — and the glyph is AUTHORED on it, not
         sampled from a font.

         Sampling cannot produce this picture. The reference is a monoline
         letterform exactly one cell thick, but a filled typeface has strokes
         many cells wide at any size that fits: a coarse grid catches almost
         nothing (measured: 3 lit cells at a 26px pitch), and a grid fine
         enough to trace the shape turns back into a dense slab. Stroking the
         text does not help either — it outlines the letters, so "T" comes back
         as two parallel lines rather than a stem.

         So the cell pitch is derived from the BOX, and the wordmark and its
         bands are laid straight onto that grid. Everything lines up in rows
         and columns by construction. */
      const cols = MONO_FIELD_COLS;
      const rows = TC_GRID.length + MONO_BANDS * 2;
      // Whichever axis runs out first decides the pitch, so it always fits.
      const pitch = Math.min((w * 0.98) / cols, (h * 0.94) / rows);
      const originX = (w - cols * pitch) / 2 + pitch / 2;
      const originY = (h - rows * pitch) / 2 + pitch / 2;
      // The wordmark is narrower than the field, so centre it in the columns.
      const glyphCol = Math.round((cols - TC_GRID[0].length) / 2);

      const homes: { x: number; y: number; dim?: boolean }[] = [];

      // The wordmark, inset by the top band.
      TC_GRID.forEach((row, r) => {
        row.split("").forEach((ch, c) => {
          if (ch !== "1") return;
          homes.push({
            x: originX + (glyphCol + c) * pitch,
            y: originY + (MONO_BANDS + r) * pitch,
          });
        });
      });

      /* THE BANDS. Full-width rows of dimmer letters above and below, on the
         same pitch and columns — what stops the wordmark reading as an object
         floating in empty space. */
      for (let b = 0; b < MONO_BANDS; b++) {
        for (const r of [b, MONO_BANDS + TC_GRID.length + b]) {
          for (let c = 0; c < cols; c++) {
            homes.push({ x: originX + c * pitch, y: originY + r * pitch, dim: true });
          }
        }
      }

      // Thin evenly rather than truncating, so the cap never lops off one side.
      const keep = Math.min(MONO_MAX, homes.length);
      const stride = homes.length / keep;

      const glyph = Math.max(9, pitch * MONO_GLYPH_RATIO);
      sprites = buildSprites(glyph);

      /* Each particle gets a seat in a 3D SHELL — a sphere, thickened a little
         so the cloud has body rather than reading as a hollow outline. Seats
         are spread with the golden-angle spiral, which distributes points over
         a sphere far more evenly than picking two random angles (that bunches
         them at the poles). */
      const radius = Math.min(w, h) * 0.62;
      particles = Array.from({ length: keep }, (_, i) => {
        const home = homes[Math.floor(i * stride)];
        const k = i + 0.5;
        const phi = Math.acos(1 - (2 * k) / keep);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;
        const r = radius * (0.78 + Math.random() * 0.34);
        return {
          hx: home.x,
          hy: home.y,
          ax: r * Math.sin(phi) * Math.cos(theta),
          ay: r * Math.sin(phi) * Math.sin(theta) * 0.72,
          az: r * Math.cos(phi),
          ch: Math.floor(Math.random() * sprites.length),
          delay: Math.random() * 0.5,
          dim: !!home.dim,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          ps: 0.5 + Math.random() * 0.8,
        };
      });
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (startedAt === null) return;
      const t = (now - startedAt) / 1000;
      ctx.clearRect(0, 0, w, h);

      const ptr = pointer.current;
      const glyph = sprites[0] ? sprites[0].width : 0;
      const dpr = window.devicePixelRatio || 1;
      const cx = w / 2;
      const cy = h / 2;

      /* PHASE 1 — ONE REVOLUTION. The whole cloud turns about its Y axis, and
         `Math.min` is what stops it dead at exactly 360°: past MONO_SPIN the
         angle is pinned at 2π rather than continuing, so the spin is one round
         and not an endless carousel. */
      const spun = reduced ? 1 : Math.min(1, t / MONO_SPIN);
      const theta = spun * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      for (const p of particles) {
        // Rotate the seat about Y, then project it with perspective.
        const rx = p.ax * cosT + p.az * sinT;
        const rz = -p.ax * sinT + p.az * cosT;
        const persp = MONO_FOCAL / (MONO_FOCAL + rz);
        const cloudX = cx + rx * persp;
        const cloudY = cy + p.ay * persp;

        /* PHASE 2 — THE SCRAMBLE, which cannot begin before the revolution is
           finished; each particle then leaves on its own delay so the cloud
           unravels into the wordmark rather than snapping to it. */
        const flight = reduced
          ? 1
          : Math.min(1, Math.max(0, (t - MONO_SPIN - p.delay) / MONO_FLIGHT));
        const e = easeInOut(flight);

        let x = cloudX + (p.hx - cloudX) * e;
        let y = cloudY + (p.hy - cloudY) * e;

        // IDLE: a small wander once home, so the wordmark breathes.
        if (e >= 1 && !reduced) {
          x += Math.sin(t * p.ps + p.px) * 1.4;
          y += Math.cos(t * p.ps + p.py) * 1.4;
        }

        // POINTER: push away, falling off with the square of distance.
        if (ptr) {
          const dx = x - ptr.x;
          const dy = y - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MONO_REACH && dist > 0.01) {
            const f = (1 - dist / MONO_REACH) ** 2 * MONO_PUSH;
            x += (dx / dist) * f;
            y += (dy / dist) * f;
          }
        }

        const sprite = sprites[p.ch];
        if (!sprite) continue;

        /* Depth reads through SIZE and BRIGHTNESS while the cloud turns — a
           letter at the back is smaller and dimmer — and both lerp back to
           flat as it lands, so the finished wordmark is evenly lit. */
        const depth = 1 + (persp - 1) * (1 - e);
        const size = (glyph / dpr) * depth;
        /* Band letters only fall back as they LAND. Through the revolution
           every letter is equal — the bands are a property of the finished
           picture, not of the cloud. */
        const settled = p.dim ? 1 - (1 - MONO_DIM) * e : 1;
        ctx.globalAlpha = (Math.min(1, 0.35 + 0.65 * depth) * (1 - e) + e) * settled;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    build();
    raf = requestAnimationFrame(draw);

    // Hold the flight until the section is actually looked at.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting) && startedAt === null) {
          startedAt = performance.now();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      const was = startedAt;
      build();
      // Keep the cloud settled if it already landed, rather than replaying.
      startedAt = was;
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      className="relative w-full"
      /* FULL COLUMN WIDTH — the same width as the copy in the other half, not
         the square VISUAL_SIZE the two circular diagrams use. This is a
         wordmark in a landscape field: it needs the room to spread, and the
         letters do their 3D revolution across this whole width before they
         scramble into the mark. */
      /* 1.5, so the grid is WIDTH-bound. The cell pitch is the smaller of
         (width / columns) and (height / rows); at 1.75 the box was short
         enough that rows won, which capped the pitch and left the wordmark
         small inside a wide frame. At 1.5 the two limits land within a pixel
         of each other, so the mark grows into the width it was given. */
      style={{ aspectRatio: "1.5" }}
      onPointerMove={(e) => {
        const el = wrapRef.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        /* Normalised through the rect, then scaled back up by the LAYOUT size:
           the particles live in unscaled canvas pixels, but the rect is the
           scaled on-screen box, so subtracting the offset alone would be off by
           the hover scale. */
        pointer.current = {
          x: ((e.clientX - b.left) / b.width) * el.offsetWidth,
          y: ((e.clientY - b.top) / b.height) * el.offsetHeight,
        };
      }}
      onPointerLeave={() => {
        pointer.current = null;
      }}
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════
   THE GATE
   ═════════════════════════════════════════════════════════ */
/**
 * Holds a visual still until the reader reaches it.
 *
 * `once: false` on purpose — the wrapper keeps reporting, so a visual scrolled
 * away is paused again rather than left running off-screen. Combined with
 * `animation-play-state` (see the rule in VISUAL_KEYFRAMES) that means coming
 * back to a part resumes it mid-cycle instead of restarting it, which is what
 * a looping ambient graphic should do.
 *
 * The threshold is low: these are tall graphics, and waiting for 35% of a
 * 440px diagram means the top third has already been on screen for a while
 * doing nothing.
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, active };
}

export default function PartVisual({ kind }: { kind: VisualKind }) {
  const { ref, active } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-eco-visual={active ? "live" : "idle"}
      /* `w-full` is load-bearing. This wrapper is itself a flex ITEM, so
         without it the browser shrinks it to an intrinsic width — and the
         monogram inside sizes itself with `min(100%, …)`, which then has no
         real basis to resolve against and collapsed the whole visual to 300px
         inside a 720px column. */
      className="flex w-full items-center justify-center"
    >
      {kind === "mandala" ? (
        <Mandala />
      ) : kind === "web" ? (
        <SpiderWeb />
      ) : kind === "monogram" ? (
        <Monogram />
      ) : (
        <Orbit />
      )}
    </div>
  );
}
