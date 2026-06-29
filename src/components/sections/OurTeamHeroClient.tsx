"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
export interface OurTeamHeroData {
  titleLine1?: string;
  titleLine2?: string;
  titleLine3?: string;
  description?: string;
  members?: string[];
}

/* ─────────────────────────────────────────────────────────
   Fallbacks & Structural Grid Mapping
   ───────────────────────────────────────────────────────── */
const FALLBACK_TITLE_1 = "Builders";
const FALLBACK_TITLE_2 = "Backing";
const FALLBACK_TITLE_3 = "Builders";
const FALLBACK_DESC = "We've built companies ourselves. We know the weight of the journey. Now we back the founders building out their dreams.";

// The grid structure dictates WHERE an image goes and HOW it behaves.
// We decouple this from the content so the layout never breaks.
const GRID_STRUCTURE = [
  { frontIsBox: true, gridClass: "lg:col-start-1 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-2 lg:row-start-1" },
  { frontIsBox: true, gridClass: "lg:col-start-3 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-4 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-5 lg:row-start-1" },
  { frontIsBox: false, gridClass: "lg:col-start-3 lg:row-start-2" },
  { frontIsBox: true, gridClass: "lg:col-start-4 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-5 lg:row-start-2" },
  { frontIsBox: false, gridClass: "lg:col-start-3 lg:row-start-3" },
  { frontIsBox: true, gridClass: "lg:col-start-4 lg:row-start-3" },
  { frontIsBox: false, gridClass: "lg:col-start-5 lg:row-start-3" },
];

const FALLBACK_IMAGES = Array.from({ length: 11 }, (_, i) => `/images/team${i + 1}.jpg`);

/* ─────────────────────────────────────────────────────────
   Sub-Components
   ───────────────────────────────────────────────────────── */
const Dot = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" className={`absolute z-20 ${className}`}>
    <circle cx="5" cy="5" r="5" fill="#323232" />
  </svg>
);

const Photo = ({ src }: { src: string }) => (
  <div className="relative h-full w-full bg-[#f0f0f0]">
    <Image 
      src={src} 
      alt="Team Member" 
      fill 
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      className="object-cover object-center"
      onError={(e) => (e.currentTarget.style.display = "none")} 
    />
  </div>
);

const BlueBox = () => <div className="h-[82%] w-[76.5%] bg-[#D3E2FF]" />;

function FlipCard({ isFlipped, frontIsBox, imgSrc, gridClass }: { isFlipped: boolean; frontIsBox: boolean; imgSrc: string; gridClass: string }) {
  return (
    <div className={`relative w-full aspect-[205/229] [perspective:1200px] ${gridClass}`}>
      <Dot className="-left-[5px] -top-[5px]" />
      <Dot className="-right-[5px] -top-[5px]" />
      <Dot className="-bottom-[5px] -left-[5px]" />
      <Dot className="-bottom-[5px] -right-[5px]" />

      <div
        className={`relative h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden]">
          {frontIsBox ? <BlueBox /> : <Photo src={imgSrc} />}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {frontIsBox ? <Photo src={imgSrc} /> : <BlueBox />}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Client Component
   ───────────────────────────────────────────────────────── */
export default function OurTeamHeroClient({ data }: { data?: OurTeamHeroData | null }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Resolve Data with Fallbacks
  const titleLine1 = data?.titleLine1 || FALLBACK_TITLE_1; 
  const titleLine2 = data?.titleLine2 || FALLBACK_TITLE_2;
  const titleLine3 = data?.titleLine3 || FALLBACK_TITLE_3;
  const description = data?.description || FALLBACK_DESC;
  
  // Map structure to images (ensures we always have 11 items for the grid)
  const teamItems = GRID_STRUCTURE.map((struct, index) => {
    const cmsImage = data?.members?.[index];
    return {
      ...struct,
      id: index,
      imgSrc: cmsImage || FALLBACK_IMAGES[index],
    };
  });

  // Global flip timer
  useEffect(() => {
    const interval = setInterval(() => setIsFlipped((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <section
        className="mx-auto flex w-full max-w-[1440px] flex-col justify-center"
        style={{
          paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
          paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div className="grid w-full grid-cols-2 gap-x-[clamp(16px,3vw,32px)] gap-y-[clamp(16px,4vw,40px)] md:grid-cols-3 lg:grid-cols-5">
          
          {/* Top Row (Items 0-4) */}
          {teamItems.slice(0, 5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}

          {/* TEXT BLOCK */}
          <div className="col-span-2 flex flex-col justify-end pt-4 md:col-span-3 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2 lg:pb-8 lg:pr-8 lg:pt-0">
            <div className="flex flex-col items-start">
              <h1 className="m-0 font-['Libre_Baskerville',_serif] text-[clamp(40px,4.5vw,64px)] font-semibold leading-[120%] text-[#0E0E0E]">
                {titleLine1}
              </h1>
              <div className="my-1 flex w-[clamp(180px,18.19vw,262px)] flex-col items-center justify-center bg-[#FBF7F0]">
                <h1 className="m-0 font-['Libre_Baskerville',_serif] text-[clamp(40px,4.5vw,64px)] font-semibold italic leading-[120%] text-[#0E0E0E]">
                  {titleLine2}
                </h1>
              </div>
              <h1 className="m-0 font-['Libre_Baskerville',_serif] text-[clamp(40px,4.5vw,64px)] font-semibold leading-[120%] text-[#0E0E0E]">
                {titleLine3}
              </h1>
            </div>
            
            <p className="mt-6 max-w-[420px] font-['Poppins',_sans-serif] text-[clamp(16px,1.6vw,24px)] font-normal leading-[150%] text-[#000]">
              {description}
            </p>
          </div>

          {/* Bottom Rows (Items 5-10) */}
          {teamItems.slice(5).map((item) => (
            <FlipCard key={item.id} {...item} isFlipped={isFlipped} />
          ))}
          
        </div>
      </section>
    </main>
  );
}