"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";
import { motion, Variants } from "framer-motion";

/*
  "Backed Early. Built to last" — showcase grid.
  Full-width section · bg #FBF7F0 · 1:1 square cards with box-shadow.
  Animated grid background (same as WinnersHero / TitanSeed hero).

  Mobile: fills viewport minus stats bar height so both sections
  are visible on the first screen.
*/

/* ═══════════════════════════════════════════════════════
   AnimatedGrid — canvas grid with cursor-follow wave distortion
   ═══════════════════════════════════════════════════════ */
function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const section = canvas.parentElement;
    if (section) {
      section.addEventListener("mousemove", onMouseMove);
      section.addEventListener("mouseleave", onMouseLeave);
    }

    let animationId: number;
    const startTime = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Smaller grid + lower opacity on mobile
    const isMobile = canvas.getBoundingClientRect().width < 768;
    const GRID_SIZE = isMobile ? 60 : 90;
    const BASE_ALPHA = isMobile ? 0.03 : 0.06;
    const CURSOR_RADIUS = 180;
    const WAVE_AMP = isMobile ? 4 : 6;
    const WAVE_BOOST = isMobile ? 0.05 : 0.10;

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      const waves = [
        { speed: 110, width: 200 },
        { speed: 75, width: 280 },
      ];

      const getRadialBoost = (px: number, py: number) => {
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        let boost = 0;
        for (const wave of waves) {
          const wavePos = (elapsed * wave.speed) % (maxDist + wave.width);
          const delta = Math.abs(dist - wavePos);
          if (delta < wave.width) {
            boost += (1 - delta / wave.width) * WAVE_BOOST;
          }
        }
        return Math.min(boost, WAVE_BOOST * 1.5);
      };

      const getWave = (px: number, py: number) => {
        const radialBoost = getRadialBoost(px, py);
        const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
        if (dist > CURSOR_RADIUS) {
          return { offset: 0, alpha: BASE_ALPHA + radialBoost };
        }
        const proximity = 1 - dist / CURSOR_RADIUS;
        const smooth = proximity * proximity;
        const offset = Math.sin(elapsed * 3 + dist * 0.04) * WAVE_AMP * smooth;
        const alpha = BASE_ALPHA + radialBoost + smooth * 0.14;
        return { offset, alpha };
      };

      for (let x = 0; x <= w; x += GRID_SIZE) {
        ctx.beginPath();
        let started = false;
        for (let y = 0; y <= h; y += 4) {
          const { offset, alpha } = getWave(x, y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          const dx = x + offset;
          if (!started) { ctx.moveTo(dx, y); started = true; }
          else { ctx.lineTo(dx, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(dx, y); }
        }
        ctx.stroke();
      }

      for (let y = 0; y <= h; y += GRID_SIZE) {
        ctx.beginPath();
        let started = false;
        for (let x = 0; x <= w; x += 4) {
          const { offset, alpha } = getWave(x, y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
          const dy = y + offset;
          if (!started) { ctx.moveTo(x, dy); started = true; }
          else { ctx.lineTo(x, dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, dy); }
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
      if (section) {
        section.removeEventListener("mousemove", onMouseMove);
        section.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [onMouseMove, onMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

const companies = [
  {
    name: "Shadowfax",
    bgImage: "/images/portfolio/shadowfax_bg.webp",
    logo: "/images/logos/Shadowfax.svg",
    logoWidth: 180,
    logoHeight: 44,
  },
  {
    name: "Credgenics",
    bgImage: "/images/portfolio/credgenics_bg.webp",
    logo: "/images/logos/Credgenics.svg",
    logoWidth: 170,
    logoHeight: 40,
  },
  {
    name: "OLA",
    bgImage: "/images/portfolio/ola_bg.webp",
    logo: "/images/logos/ola.svg",
    logoWidth: 100,
    logoHeight: 40,
  },
  {
    name: "Zouk",
    bgImage: "/images/portfolio/zouk_bg.webp",
    logo: "/images/logos/zouk_new_logo.webp",
    logoWidth: 80,
    logoHeight: 34,
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut",
      delay: 0.15 + i * 0.1,
    },
  }),
};

export default function BackedEarly() {
  return (
    <section
      className="relative flex w-full items-center justify-center overflow-hidden bg-[#FBF7F0] min-h-[calc(100svh-var(--nav-height)-110px)] lg:min-h-[calc(100svh-var(--nav-height))]"
      style={{
        marginTop: "var(--nav-height)",
        paddingTop: "clamp(28px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(20px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* ── ANIMATED GRID BACKGROUND ── */}
      <AnimatedGrid />

      <div className="relative z-10 flex w-full flex-col items-center">

        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* "Backed Early." */}
          <motion.h2
            className="m-0 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-[115%] text-[#001A4D]"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" },
              },
            }}
          >
            Backed Early.
          </motion.h2>

          {/* "Built to last" — highlighted italic */}
          <motion.div
            className="relative mt-[clamp(4px,0.5vw,8px)] inline-flex items-center justify-center overflow-hidden bg-transparent px-[4px] py-[8px] md:px-[6px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.6 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold italic leading-[115%] text-[#001A4D]"
            >
              Built to last
            </span>
          </motion.div>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-2 gap-[clamp(12px,1.5vw,20px)] lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {companies.map((company, i) => (
            <motion.div
              key={company.name}
              custom={i}
              variants={cardVariants}
              className="group relative w-full cursor-pointer overflow-hidden transition-shadow duration-300 ease-out hover:shadow-[0_0_20px_10px_rgba(166,166,166,0.3)]"
              style={{
                aspectRatio: "1 / 1",
                borderRadius: "clamp(8px, 0.83vw, 12px)",
                boxShadow: "0 0 14px 8px rgba(166, 166, 166, 0.25)",
              }}
            >
              {/* Background image — fills card via object-cover */}
              <Image
                src={company.bgImage}
                alt={company.name}
                fill
                sizes="(max-width: 1024px) 45vw, 24vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient overlay at bottom for logo legibility */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
                style={{
                  height: "45%",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
                }}
              />

              {/* Logo — bottom-left */}
              <div
                className="absolute bottom-0 left-0 z-[2] flex items-end transition-transform duration-300 ease-out group-hover:translate-y-[-4px]"
                style={{
                  padding: "clamp(14px, min(1.8vw, 2.6vh), 24px)",
                }}
              >
                <div
                  className="relative"
                  style={{
                    width: `clamp(${company.logoWidth * 0.55}px, ${(company.logoWidth / 1440) * 100}vw, ${company.logoWidth}px)`,
                    height: `clamp(${company.logoHeight * 0.55}px, ${(company.logoHeight / 1440) * 100}vw, ${company.logoHeight}px)`,
                  }}
                >
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    sizes="180px"
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
