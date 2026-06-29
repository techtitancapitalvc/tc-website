"use client";

import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   MOCK DATA: Swap images and bios as needed.
   ═══════════════════════════════════════════════════════ */
const FOUNDERS = [
  {
    id: "kunal",
    name: "Kunal Bahl",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/kunalbahl/",
    image: "/images/kunal-bahl.jpg", // Replace with your actual image path
    bio: "Co-founder of Snapdeal, one of India's most iconic e-commerce companies. Kunal brings rare operator insight to every investment, having navigated hyper-growth, deep turbulence, and an enduring rebuild. That experience shapes every conversation he has with founders today. He doesn't advise from theory. He advises from scars.",
    imagePosition: "left" as const,
  },
  {
    id: "rohit",
    name: "Rohit Bansal",
    role: "Co-Founder, Titan Capital",
    linkedin: "https://www.linkedin.com/in/rohitbansal/",
    image: "/images/rohit-bansal.jpg", // Replace with your actual image path
    bio: "Co-founder of Snapdeal and a deeply technical operator. Rohit brings product depth and business architecture thinking to every portfolio company he touches. His pattern recognition across consumer internet, fintech, and SaaS comes from building, not just investing.",
    imagePosition: "right" as const,
  },
];

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    fill="none"
    className="transition-transform duration-200 hover:scale-110 hover:opacity-80"
    style={{
      width: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
      height: "clamp(32px, min(3.33vw, 4.88vh), 48px)",
      aspectRatio: "1 / 1",
    }}
  >
    <path
      d="M40.9411 3.99979H7.06109C6.68025 3.9945 6.3021 4.06429 5.94823 4.20516C5.59435 4.34603 5.2717 4.55523 4.99869 4.82082C4.72568 5.0864 4.50766 5.40316 4.35708 5.75301C4.2065 6.10286 4.12631 6.47895 4.12109 6.85979V41.1398C4.12631 41.5206 4.2065 41.8967 4.35708 42.2466C4.50766 42.5964 4.72568 42.9132 4.99869 43.1788C5.2717 43.4443 5.59435 43.6535 5.94823 43.7944C6.3021 43.9353 6.68025 44.0051 7.06109 43.9998H40.9411C41.3219 44.0051 41.7001 43.9353 42.054 43.7944C42.4078 43.6535 42.7305 43.4443 43.0035 43.1788C43.2765 42.9132 43.4945 42.5964 43.6451 42.2466C43.7957 41.8967 43.8759 41.5206 43.8811 41.1398V6.85979C43.8759 6.47895 43.7957 6.10286 43.6451 5.75301C43.4945 5.40316 43.2765 5.0864 43.0035 4.82082C42.7305 4.55523 42.4078 4.34603 42.054 4.20516C41.7001 4.06429 41.3219 3.9945 40.9411 3.99979ZM16.1811 37.4798H10.1811V19.4798H16.1811V37.4798ZM13.1811 16.9598C12.3536 16.9598 11.56 16.6311 10.9749 16.046C10.3898 15.4609 10.0611 14.6673 10.0611 13.8398C10.0611 13.0123 10.3898 12.2187 10.9749 11.6336C11.56 11.0485 12.3536 10.7198 13.1811 10.7198C13.6205 10.67 14.0654 10.7135 14.4868 10.8476C14.9082 10.9816 15.2966 11.2032 15.6264 11.4977C15.9562 11.7923 16.2201 12.1531 16.4008 12.5568C16.5815 12.9604 16.6749 13.3976 16.6749 13.8398C16.6749 14.282 16.5815 14.7192 16.4008 15.1228C16.2201 15.5264 15.9562 15.8873 15.6264 16.1819C15.2966 16.4764 14.9082 16.698 14.4868 16.832C14.0654 16.9661 13.6205 17.0096 13.1811 16.9598ZM37.8211 37.4798H31.8211V27.8198C31.8211 25.3998 30.9611 23.8198 28.7811 23.8198C28.1064 23.8247 27.4495 24.0364 26.8988 24.4261C26.3481 24.8159 25.9301 25.3651 25.7011 25.9998C25.5446 26.4699 25.4768 26.9649 25.5011 27.4598V37.4598H19.5011V19.4598H25.5011V21.9998C26.0462 21.054 26.8389 20.2748 27.794 19.7462C28.749 19.2176 29.8302 18.9595 30.9211 18.9998C34.9211 18.9998 37.8211 21.5798 37.8211 27.1198V37.4798Z"
      fill="#003CB3"
    />
  </svg>
);

function FounderProfile({ founder }: { founder: typeof FOUNDERS[0] }) {
  const isImageLeft = founder.imagePosition === "left";

  return (
    <div
      className={`flex w-full flex-col items-center justify-between ${
        isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
      style={{
        gap: "clamp(32px, min(5.55vw, 8.14vh), 80px)",
      }}
    >
      {/* ── IMAGE ── */}
      <div
        className="relative shrink-0 overflow-hidden bg-gray-200"
        style={{
          width: "clamp(280px, min(31.59vw, 46.33vh), 455px)",
          height: "clamp(368px, min(41.59vw, 61vh), 599px)",
          borderRadius: "12px",
        }}
      >
        <Image
          src={founder.image}
          alt={founder.name}
          fill
          sizes="(max-width: 1024px) 90vw, 32vw"
          className="object-cover object-center"
          // Safe fallback if images aren't loaded yet
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      {/* ── CONTENT ── */}
      <div 
        className="flex flex-col items-start lg:w-[calc(100%-clamp(280px,min(31.59vw,46.33vh),455px)-clamp(32px,min(5.55vw,8.14vh),80px))]"
        style={{
          maxWidth: "717px", 
        }}
      >
        {/* Highlighted Name */}
        <div className="inline-block bg-[#D3E2FF] px-[12px] py-[4px] mb-[12px]">
          <h3
            className="m-0 font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
            style={{
              fontSize: "clamp(28px, min(3.33vw, 4.88vh), 48px)",
              lineHeight: "158%",
            }}
          >
            {founder.name}
          </h3>
        </div>

        {/* Role */}
        <p
          className="m-0 font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
          style={{
            fontSize: "clamp(20px, min(2.22vw, 3.25vh), 32px)",
            lineHeight: "158%",
          }}
        >
          {founder.role}
        </p>

        {/* LinkedIn */}
        <div className="mt-[clamp(12px,min(1.6vw,2.4vh),24px)]">
          <Link href={founder.linkedin} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon />
          </Link>
        </div>

        {/* Bio */}
        <p
          className="font-['Poppins',_sans-serif] font-normal text-[#323232]"
          style={{
            marginTop: "clamp(20px, min(2.77vw, 4.07vh), 40px)",
            fontSize: "clamp(14px, min(1.38vw, 2.03vh), 20px)",
            lineHeight: "160%",
          }}
        >
          {founder.bio}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function LedByFoundersPage() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <section
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center bg-[#FBF7F0]"
        style={{
          paddingTop: "clamp(60px, min(8vw, 10vh), 120px)",
          paddingBottom: "clamp(60px, min(8vw, 10vh), 120px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        {/* ── SECTION HEADING ── */}
        <div className="flex w-full flex-col items-center text-center">
          {/* Highlighted Italic Top Line */}
          <div className="inline-block bg-[#D3E2FF] px-[16px] py-[4px]">
            <h2
              className="m-0 font-['Libre_Baskerville',_serif] font-semibold italic text-[#001A4D]"
              style={{
                fontSize: "clamp(32px, min(4.44vw, 6.51vh), 64px)",
                lineHeight: "120%",
              }}
            >
              Led By Founders
            </h2>
          </div>
          
          {/* Normal Bottom Line */}
          <h2
            className="m-0 mt-2 font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
            style={{
              fontSize: "clamp(32px, min(4.44vw, 6.51vh), 64px)",
              lineHeight: "120%",
            }}
          >
            Who've Walked The Path.
          </h2>
        </div>

        {/* ── FOUNDERS LIST ── */}
        <div
          className="flex w-full flex-col"
          style={{
            marginTop: "clamp(48px, min(6.66vw, 9.77vh), 96px)",
            gap: "clamp(64px, min(8vw, 12vh), 120px)", // Large gap between the two founders
          }}
        >
          {FOUNDERS.map((founder) => (
            <FounderProfile key={founder.id} founder={founder} />
          ))}
        </div>
      </section>
    </main>
  );
}