"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/*
  Removed the hardcoded brandColor and brandColorDark.
  The component will now dynamically extract them from the logo itself!
*/
const portfolioCompanies = [
  {
    name: "Boba Bhai",
    logo: "/images/logos/bobabhai-logo.webp",
    category: "QSR & cloud kitchens",
    logoScale: 1,
  },
  {
    name: "Zouk",
    logo: "/images/logos/zouk_new_logo.webp",
    category: "Vegan leather goods",
    logoScale: 0.8,
  },
  {
    name: "BECO",
    logo: "/images/logos/BECO.webp",
    category: "Sustainable home products",
    logoScale: 1,
  },
  {
    name: "Simplismart",
    logo: "/images/logos/Simplismart.webp",
    category: "AI infrastructure",
    logoScale: 1,
  },
  {
    name: "Supertails",
    logo: "/images/logos/Supertails.png",
    category: "Pet products marketplace",
    logoScale: 1,
  },
  {
    name: "HomeRun",
    logo: "/images/logos/homerun1.webp",
    category: "B2B quick commerce",
    logoScale: 1,
  }, 
  {
    name: "Anveshan",
    logo: "/images/logos/anveshan.webp",
    category: "Pure & natural foods",
    logoScale: 1,
  },
  {
    name: "Mitigata",
    logo: "/images/logos/mitigata-logo.webp",
    category: "Full-stack cyber security",
    logoScale: 1,
  },
  {
    name: "Park+",
    logo: "/images/logos/Park+.webp",
    category: "Automobile platform",
    logoScale: 1,
  },
  {
    name: "MEKR",
    logo: "/images/logos/mekr-logo.webp",
    category: "Appliance Manufacturing ·",
    logoScale: 1,
  },
];

// Helper to mix a color with white to maintain your beautiful pastel gradient aesthetic
const mixWithWhite = (r: number, g: number, b: number, percentWhite: number) => {
  const newR = Math.round(r + (255 - r) * percentWhite);
  const newG = Math.round(g + (255 - g) * percentWhite);
  const newB = Math.round(b + (255 - b) * percentWhite);
  return `rgb(${newR}, ${newG}, ${newB})`;
};

/* ── Card — monochrome by default, dynamic gradient colour on hover ── */
function PortfolioCard({
  company,
  index,
}: {
  company: (typeof portfolioCompanies)[number];
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const targetRef = useRef(0); // 0 = white, 1 = brandColor
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [isActive, setIsActive] = useState(false);

  // State to hold our dynamically extracted colors
  const [gradientColors, setGradientColors] = useState({
    light: "#F5F5F5",
    dark: "#E0E0E0",
  });

  // Dynamically extract the dominant color from the image on mount
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = company.logo;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const alpha = imageData[i + 3];
        const pr = imageData[i];
        const pg = imageData[i + 1];
        const pb = imageData[i + 2];

        // Skip fully transparent pixels and pure white backgrounds to find the ACTUAL brand color
        if (alpha < 50) continue;
        if (pr > 240 && pg > 240 && pb > 240) continue;

        r += pr;
        g += pg;
        b += pb;
        count++;
      }

      if (count > 0) {
        const avgR = Math.floor(r / count);
        const avgG = Math.floor(g / count);
        const avgB = Math.floor(b / count);

        // Convert the raw color into the soft pastel versions you used originally
        setGradientColors({
          light: mixWithWhite(avgR, avgG, avgB, 0.85), // 85% white for the inner gradient
          dark: mixWithWhite(avgR, avgG, avgB, 0.70),  // 70% white for the outer edges
        });
      }
    };
  }, [company.logo]);

  const drawFill = useCallback(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;

    // Gentle ease towards target
    progressRef.current += (targetRef.current - progressRef.current) * 0.04;
    if (Math.abs(progressRef.current - targetRef.current) < 0.001) {
      progressRef.current = targetRef.current;
    }

    ctx.clearRect(0, 0, w, h);

    if (progressRef.current > 0.001) {
      const p = progressRef.current;

      // Radial gradient: white at center → extracted brand colour at edges
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.sqrt(cx * cx + cy * cy);

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${p})`);
      gradient.addColorStop(0.4, gradientColors.light);
      gradient.addColorStop(1, gradientColors.dark);

      ctx.globalAlpha = p;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    if (Math.abs(progressRef.current - targetRef.current) > 0.001) {
      animRef.current = requestAnimationFrame(drawFill);
    }

    if (card) {
      card.setAttribute(
        "data-hovered",
        targetRef.current === 1 ? "true" : "false"
      );
    }
  }, [gradientColors]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (card) {
        const rect = card.getBoundingClientRect();
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
        card.setAttribute("data-hovered", "true");
      }
      setIsActive(true);
      targetRef.current = 1;
      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(drawFill);
    },
    [drawFill]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) card.setAttribute("data-hovered", "false");
    setIsActive(false);
    targetRef.current = 0;
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFill);
  }, [drawFill]);

  /* Touch support for mobile — mirrors mouse enter/leave */
  const handleTouchStart = useCallback(() => {
    const card = cardRef.current;
    if (card) card.setAttribute("data-hovered", "true");
    setIsActive(true);
    targetRef.current = 1;
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFill);
  }, [drawFill]);

  const handleTouchEnd = useCallback(() => {
    const card = cardRef.current;
    if (card) card.setAttribute("data-hovered", "false");
    setIsActive(false);
    targetRef.current = 0;
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFill);
  }, [drawFill]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.15 + index * 0.08,
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      data-hovered="false"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="portfolio-card group relative flex cursor-pointer flex-col items-center overflow-hidden bg-white"
      style={{
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)",
        width: "100%",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Canvas for animated colour gradient fill */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 0, borderRadius: "inherit" }}
      />

      {/* Category label */}
      <p
        className="relative z-10 w-full text-center font-['Poppins',_sans-serif] font-normal text-[#323232] transition-colors duration-300"
        style={{
          paddingTop: "clamp(16px, min(2.5vw, 3.5vh), 32px)",
          fontSize: "clamp(11px, min(1.1vw, 1.6vh), 16px)",
        }}
      >
        {company.category}
      </p>

      {/* Logo — grayscale by default, full colour on hover */}
      <div className="relative z-10 flex flex-1 w-full items-center justify-center px-[15%]">
        <div
          className={`relative w-full transition-[filter] duration-500 ease-out ${isActive ? "grayscale-0" : "grayscale"}`}
          style={{
            height: "clamp(36px, min(4.5vw, 6.5vh), 64px)",
            transform: `scale(${company.logoScale})`,
          }}
        >
          <Image
            src={company.logo}
            alt={company.name}
            fill
            sizes="(max-width: 768px) 40vw, 20vw"
            className="object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function PortfolioWinnerFund() {
  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#FBF7F0]"
      style={{
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center">

        {/* ── HEADING ── */}
        <motion.div
          className="mb-[clamp(28px,min(4vw,6vh),56px)] flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* "Portfolio Company" — highlighted */}
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[6px] py-[8px] md:px-[8px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
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
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[110%] text-[#001A4D] max-md:!text-[28px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              Portfolio Company
            </span>
          </motion.div>

          {/* "Winner Fund" */}
          <motion.h2
            className="mt-[clamp(4px,0.5vw,8px)] m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[110%] text-[#001A4D] max-md:!text-[28px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            Winner Fund
          </motion.h2>
        </motion.div>

        {/* ── CARD GRID ── */}
        <motion.div
          className="grid w-full grid-cols-2 gap-[clamp(12px,1.5vw,20px)] md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {portfolioCompanies.map((company, i) => (
            <PortfolioCard key={company.name} company={company} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}