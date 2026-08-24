"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The four diagrams on the /titanEcosystem rail.
 *
 * They live apart from the section so that file stays about LAYOUT — the
 * scroll line, the pointer, the alternating columns — and this one is only
 * about drawing. Pick one with `<PartVisual kind="…" />`.
 *
 *   orbit      six satellites breathing in and out around a dashed ring
 *   triangle   a triangle that becomes a six-pointed star and back, turning
 *   web        a hub with drifting legs that reaches for the pointer
 *   monogram   thousands of letters flying in to settle into "TC"
 *
 * THREE DIFFERENT ENGINES, each for a reason:
 *
 *   CSS keyframes   anything that must run forever with no input — the orbit,
 *                   the star, the web's idle drift. Keeps moving whether or
 *                   not React renders.
 *   React state     the web's pointer reaction, because a leg's far end is
 *                   `x2`/`y2` — SVG attributes CSS cannot animate — and the
 *                   line and its node must move as one. Twelve legs is cheap.
 *   Canvas          the monogram alone, because thousands of particles is far
 *                   past what the DOM will animate. See its own note.
 *
 * DETERMINISM. The three SVG/DOM visuals never call Math.random: a random
 * value chosen during render differs between server and client and React
 * would report a hydration mismatch, so every "random" offset there is a
 * hand-picked constant. The canvas is exempt — it builds its particles inside
 * an effect, which only ever runs on the client.
 */

/* ─────────────────────────────────────────────────────────
   Shared geometry. Sizes are `min(vw, vh)` against the
   1728x1117 reference so they shrink on narrow AND short
   screens, then clamp at both ends.
   ───────────────────────────────────────────────────────── */
export const VISUAL_SIZE = "clamp(220px, min(26vw, 40vh), 440px)";
const ORBIT_DOT = "clamp(26px, min(3.24vw, 5.01vh), 56px)";
/** Dash pattern for every dashed path here, in SCREEN px — see the
 *  non-scaling-stroke note on the orbit ring for why the unit is pixels. */
const DASH = "26 16";
/** The same pattern at the smaller scale the triangle and web draw at. */
const DASH_FINE = "8 7";

const SPIN_SECONDS = 20;
const PULSE_SECONDS = 11;

const EASE_CSS = "cubic-bezier(0.22,1,0.36,1)";
/** Symmetric, for anything that expands and then contracts — the house
 *  ease-out front-loads and would make a collapse land in a few percent. */
const EASE_BREATHE = "cubic-bezier(0.45,0,0.55,1)";

const STROKE = "rgba(255,255,255,0.45)";
const STROKE_SOFT = "rgba(255,255,255,0.3)";
/** The spider. The reference is red on black; on this navy that would read as
 *  an error state, so it takes the section's own light blue instead. */
const SPIDER_BODY = "rgba(210,230,255,0.95)";
const SPIDER_THREAD = "rgba(150,190,255,0.8)";

export type VisualKind = "orbit" | "triangle" | "web" | "monogram";

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

/* ── TRIANGLE becomes STAR ──
   A six-pointed star is two overlapping triangles, so the morph is not a
   shape-tween at all: the second triangle simply grows in and out of the
   first. That is why the points always land exactly on the star and never
   drift, which a points-array tween between 3 and 6 vertices cannot promise.
   The second triangle also counter-turns slightly as it arrives, so it looks
   like it rotates INTO position rather than just fading up. */
@keyframes eco-tri-b {
  0%   { opacity: 0; transform: rotate(-60deg) scale(0.35); }
  16%  { opacity: 0; transform: rotate(-60deg) scale(0.35); }
  42%  { opacity: 1; transform: rotate(0deg)   scale(1); }
  62%  { opacity: 1; transform: rotate(0deg)   scale(1); }
  88%  { opacity: 0; transform: rotate(-60deg) scale(0.35); }
  100% { opacity: 0; transform: rotate(-60deg) scale(0.35); }
}
/* The first triangle breathes very slightly against it, so the pair reads as
   one object changing rather than one object with a passenger. */
@keyframes eco-tri-a {
  0%   { transform: scale(1); }
  42%  { transform: scale(0.94); }
  62%  { transform: scale(0.94); }
  100% { transform: scale(1); }
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
   2. TRIANGLE → STAR
   ═════════════════════════════════════════════════════════ */
/** Radius of the vertices, in the 100-unit viewBox. */
const TRI_R = 36;
/** Vertex marker radius. */
const TRI_NODE = 4.6;

/** The six hexagram vertices. `offset` picks which triangle. */
function triPoints(offset: number) {
  return [0, 1, 2].map((k) => {
    const a = ((offset + k * 120 - 90) * Math.PI) / 180;
    return { x: 50 + TRI_R * Math.cos(a), y: 50 + TRI_R * Math.sin(a) };
  });
}

function TriangleStar() {
  const A = triPoints(0);
  const B = triPoints(60);
  const path = (p: { x: number; y: number }[]) =>
    `${p.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(" ")}`;

  return (
    <div
      className="relative shrink-0"
      style={{ width: VISUAL_SIZE, height: VISUAL_SIZE }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        style={{
          overflow: "visible",
          animation: `eco-spin-slow ${SPIN_SECONDS * 1.6}s linear infinite`,
          transformBox: "view-box",
          transformOrigin: "50px 50px",
          willChange: "transform",
        }}
      >
        {/* Triangle A — always present. */}
        <g
          style={{
            animation: `eco-tri-a ${PULSE_SECONDS}s ${EASE_BREATHE} infinite`,
            transformBox: "view-box",
            transformOrigin: "50px 50px",
          }}
        >
          <polygon
            points={path(A)}
            fill="none"
            stroke={STROKE}
            strokeWidth="1"
            strokeDasharray={DASH_FINE}
            vectorEffect="non-scaling-stroke"
          />
          {A.map((v, i) => (
            <circle
              key={i}
              cx={v.x}
              cy={v.y}
              r={TRI_NODE}
              fill="#00112E"
              stroke={STROKE}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Triangle B — grows in to complete the star, then leaves again. */}
        <g
          style={{
            animation: `eco-tri-b ${PULSE_SECONDS}s ${EASE_BREATHE} infinite`,
            transformBox: "view-box",
            transformOrigin: "50px 50px",
            willChange: "transform, opacity",
          }}
        >
          <polygon
            points={path(B)}
            fill="none"
            stroke={STROKE}
            strokeWidth="1"
            strokeDasharray={DASH_FINE}
            vectorEffect="non-scaling-stroke"
          />
          {B.map((v, i) => (
            <circle
              key={i}
              cx={v.x}
              cy={v.y}
              r={TRI_NODE}
              fill="#00112E"
              stroke={STROKE}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
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
];
/** How many threads the spider holds at once. */
const SPIDER_LEGS = 9;
/** How far a thread will stretch, in viewBox units. */
const SPIDER_REACH = 30;
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
function SpiderWeb() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGRectElement>(null);
  const legRefs = useRef<(SVGLineElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let bx = 50;
    let by = 50;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - start) / 1000;

      /* Target: the pointer, or a slow wander when it is away. The two curves
         have different periods so the path never repeats tightly. */
      const p = pointer.current;
      const tx = p ? p.x : 50 + Math.sin(t * 0.31) * 30;
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
      const near = WEB_DOTS.map(([x, y]) => ({
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
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative shrink-0"
      style={{ width: VISUAL_SIZE, height: VISUAL_SIZE }}
      aria-hidden
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="h-full w-full"
        style={{ overflow: "visible" }}
        onPointerMove={(e) => {
          const b = svgRef.current?.getBoundingClientRect();
          if (!b) return;
          pointer.current = {
            x: ((e.clientX - b.left) / b.width) * 100,
            y: ((e.clientY - b.top) / b.height) * 100,
          };
        }}
        onPointerLeave={() => {
          pointer.current = null;
        }}
      >
        {/* The field. Built once — the loop above never touches these. */}
        {WEB_DOTS.map(([x, y], i) => (
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
   4. "TC" MONOGRAM — thousands of letters converging
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
const MONO_TEXT = "TC";
/** The alphabet the flying particles are drawn from. */
const MONO_ALPHABET = "TITANCAPITAL";
/** Sampling step in CSS px. Particle count scales as 1/step², so this is the
 *  dial for density: measured on the live canvas, step 4 gave 1,341 targets
 *  and step 3 gives ~2,380 — the difference between "a lot of letters" and
 *  the thousands the brief asks for. */
const MONO_STEP = 3;
/** Hard cap, so a very large viewport cannot melt a laptop. */
const MONO_MAX = 2600;
/** Seconds for the flight in. */
const MONO_FLIGHT = 2.4;
/** Pointer influence radius and peak push, in CSS px. */
const MONO_REACH = 120;
const MONO_PUSH = 34;

type Particle = {
  /** where it settles */
  hx: number;
  hy: number;
  /** where it flies in from */
  sx: number;
  sy: number;
  /** current position */
  x: number;
  y: number;
  /** sprite index, rotation, and its own stagger */
  ch: number;
  rot: number;
  delay: number;
  /** idle drift */
  px: number;
  py: number;
  ps: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

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
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Offscreen: draw TC as large as it will go, then read it back.
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      let font = h * 0.9;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      for (let i = 0; i < 40; i++) {
        octx.font = `700 ${font}px Poppins, sans-serif`;
        if (octx.measureText(MONO_TEXT).width <= w * 0.92) break;
        font *= 0.94;
      }
      octx.fillStyle = "#fff";
      octx.fillText(MONO_TEXT, w / 2, h / 2);
      const data = octx.getImageData(0, 0, w, h).data;

      const homes: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += MONO_STEP) {
        for (let x = 0; x < w; x += MONO_STEP) {
          if (data[(y * w + x) * 4 + 3] > 128) homes.push({ x, y });
        }
      }
      // Thin evenly rather than truncating, so the cap never lops off one side.
      const keep = Math.min(MONO_MAX, homes.length);
      const stride = homes.length / keep;

      const glyph = Math.max(5, MONO_STEP * 2.1);
      sprites = buildSprites(glyph);

      particles = Array.from({ length: keep }, (_, i) => {
        const home = homes[Math.floor(i * stride)];
        // Fly in from a ring well outside the frame.
        const a = Math.random() * Math.PI * 2;
        const d = Math.max(w, h) * (0.7 + Math.random() * 0.7);
        return {
          hx: home.x,
          hy: home.y,
          sx: w / 2 + Math.cos(a) * d,
          sy: h / 2 + Math.sin(a) * d,
          x: home.x,
          y: home.y,
          ch: Math.floor(Math.random() * sprites.length),
          rot: (Math.random() - 0.5) * Math.PI * 2,
          delay: Math.random() * 0.45,
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

      for (const p of particles) {
        // FLIGHT: each particle has its own delay, so the cloud arrives as a
        // stream rather than as one block.
        const local = reduced ? 1 : Math.min(1, Math.max(0, (t - p.delay) / MONO_FLIGHT));
        const e = easeOut(local);
        let x = p.sx + (p.hx - p.sx) * e;
        let y = p.sy + (p.hy - p.sy) * e;

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

        p.x = x;
        p.y = y;

        const sprite = sprites[p.ch];
        if (!sprite) continue;
        const size = glyph / (window.devicePixelRatio || 1);
        // Spin while flying, upright once home.
        const rot = p.rot * (1 - e);
        if (rot !== 0) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rot);
          ctx.globalAlpha = Math.min(1, e * 1.6);
          ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
          ctx.restore();
        } else {
          ctx.globalAlpha = 1;
          ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
        }
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
      className="relative shrink-0"
      style={{ width: VISUAL_SIZE, height: `calc(${VISUAL_SIZE} * 0.62)` }}
      onPointerMove={(e) => {
        const b = wrapRef.current?.getBoundingClientRect();
        if (b) pointer.current = { x: e.clientX - b.left, y: e.clientY - b.top };
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

/* ═════════════════════════════════════════════════════════ */
export default function PartVisual({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case "triangle":
      return <TriangleStar />;
    case "web":
      return <SpiderWeb />;
    case "monogram":
      return <Monogram />;
    case "orbit":
    default:
      return <Orbit />;
  }
}
