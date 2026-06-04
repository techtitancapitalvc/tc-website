"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Pre-configured mock data matching the screenshot categories
const menuData = [
  {
    id: "about",
    title: "ABOUT",
    subItems: ["Our Story", "Team", "Careers", "Contact"],
  },
  {
    id: "for-founders",
    title: "FOR FOUNDERS",
    subItems: ["Get investment", "Beyond The Cheque", "Titan Seed Funding", "Titan Winner Fund"],
  },
  {
    id: "portfolio",
    title: "PORTFOLIO",
    subItems: ["All Companies", "Recent Exits", "Sector Focus"],
  },
  {
    id: "community",
    title: "COMMUNITY",
    subItems: ["Events", "Founder Network", "Resources"],
  },
  {
    id: "perspective",
    title: "PERSPECTIVE",
    subItems: ["Blog", "News", "Podcasts", "Reports"],
  },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  // Lock body scroll when the full-screen menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setActiveSubMenu(null); // Reset sub-menu when main menu closes
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* =========================================
          MAIN TOP NAVBAR
          ========================================= */}
      <nav className="fixed left-0 top-0 z-[40] flex h-[77px] w-full items-center justify-between bg-[linear-gradient(90deg,#001A4D_0%,#001A4D_58.17%,#003C82_74.52%,#06C_89.42%,#001A4D_100%)] px-4 md:px-[62px]">
        
        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex h-[41px] w-[41px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white p-[8px] transition-opacity hover:opacity-90 md:p-[13px]"
          aria-label="Open Menu"
        >
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
            <path d="M17.7678 17.7678C18.2366 17.2989 18.5 16.663 18.5 16C18.5 15.337 18.2366 14.7011 17.7678 14.2322C17.2989 13.7634 16.663 13.5 16 13.5C15.337 13.5 14.7011 13.7634 14.2322 14.2322C13.7634 14.7011 13.5 15.337 13.5 16C13.5 16.663 13.7634 17.2989 14.2322 17.7678C14.7011 18.2366 15.337 18.5 16 18.5C16.663 18.5 17.2989 18.2366 17.7678 17.7678Z" fill="#001A4D" />
            <path d="M17.7678 29.2678C17.2989 29.7366 16.663 30 16 30C15.337 30 14.7011 29.7366 14.2322 29.2678C13.7634 28.7989 13.5 28.163 13.5 27.5C13.5 26.837 13.7634 26.2011 14.2322 25.7322C14.7011 25.2634 15.337 25 16 25C16.663 25 17.2989 25.2634 17.7678 25.7322C18.2366 26.2011 18.5 26.837 18.5 27.5C18.5 28.163 18.2366 28.7989 17.7678 29.2678Z" fill="#001A4D" />
            <path d="M17.7678 6.26777C18.2366 5.79893 18.5 5.16304 18.5 4.5C18.5 3.83696 18.2366 3.20107 17.7678 2.73223C17.2989 2.26339 16.663 2 16 2C15.337 2 14.7011 2.26339 14.2322 2.73223C13.7634 3.20107 13.5 3.83696 13.5 4.5C13.5 5.16304 13.7634 5.79893 14.2322 6.26777C14.7011 6.73661 15.337 7 16 7C16.663 7 17.2989 6.73661 17.7678 6.26777Z" fill="#001A4D" />
          </svg>
        </button>

        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/logos/titancapitallogo.svg"
            alt="Titan Capital"
            width={127}
            height={42}
            priority
            className="h-[33px] w-[100px] object-cover brightness-0 invert md:h-[42px] md:w-[127px]"
          />
        </Link>

        <Link
          href="/get-investment"
          className="flex h-[40px] w-auto shrink-0 items-center justify-center gap-[10px] rounded-[9px] bg-white px-[16px] text-center font-['Libre_Baskerville',_serif] text-[14px] font-semibold leading-[107%] text-[#001A4D] transition-opacity hover:opacity-90 md:h-[47px] md:w-[187px] md:p-[10px] md:text-[16px]"
        >
          Get Investment
        </Link>
      </nav>

      {/* =========================================
          SIDEBAR OVERLAY & MENU SYSTEM
          ========================================= */}
      
      {/* Background Dark Overlay */}
      <div
        className={`fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sliding Navigation Container */}
      <div
        className={`fixed left-0 top-0 z-[50] flex h-screen transition-transform duration-500 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* --- MAIN MENU PANEL --- */}
        {/* Adjusted padding to the inner elements so hover highlights bleed to the edges */}
        <div className="relative z-20 flex h-full w-[85vw] max-w-[578px] flex-col overflow-y-auto bg-[#001A4D] py-10 md:pb-[98px] md:pt-[41px]">
          
          {/* Top Controls (Back Button & Home) */}
          <div className="mb-[54px] flex flex-col items-start gap-8 px-6 md:px-[36px]">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="cursor-pointer transition-opacity hover:opacity-70"
              aria-label="Close Menu"
            >
              {/* Back Button SVG matching Screenshot */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M14 16l-4-4 4-4" />
              </svg>
            </button>

            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-['Libre_Baskerville',_serif] text-[18px] font-medium tracking-wide text-white transition-opacity hover:opacity-80"
            >
              HOME
            </Link>
          </div>

          {/* Menu Categories List */}
          <div className="flex w-full flex-col gap-2">
            {menuData.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSubMenu(item.id === activeSubMenu ? null : item.id)}
                className={`flex w-full cursor-pointer items-center justify-between px-6 py-5 transition-colors duration-200 md:px-[36px] md:py-6 ${
                  activeSubMenu === item.id ? "bg-[#002868]" : "hover:bg-[#002868]/40"
                }`}
              >
                <span className="font-['Libre_Baskerville',_serif] text-[clamp(32px,4vw,40px)] font-medium leading-[120%] text-white">
                  {item.title}
                </span>
                
                {/* Right Chevron SVG */}
                <svg width="14" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* --- SUB-MENU PANEL --- */}
        {/* Positioned absolutely so it hides *under* the main menu when closed, 
            and slides out to the right (desktop) or covers (mobile) when active */}
        <div
          className={`absolute left-0 top-0 -z-10 flex h-full w-[85vw] max-w-[473px] flex-col overflow-y-auto bg-[#FBF7F0] px-8 py-10 transition-transform duration-500 ease-in-out md:left-full md:px-[40px] md:py-[180px] ${
            activeSubMenu 
              ? "translate-x-0 md:translate-x-0" 
              : "-translate-x-full md:-translate-x-full"
          }`}
        >
          {/* Mobile-only "Back to Main Menu" button */}
          <button
            className="mb-10 flex cursor-pointer items-center gap-2 font-['Poppins',_sans-serif] font-medium text-[#001A4D] md:hidden"
            onClick={() => setActiveSubMenu(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Categories
          </button>

          {/* Sub Menu Links */}
          <div className="flex flex-col items-start gap-[20px]">
            {menuData
              .find((m) => m.id === activeSubMenu)
              ?.subItems.map((subItem, idx) => (
                <Link
                  key={idx}
                  href={`/${subItem.toLowerCase().replace(/\s+/g, "-")}`} // Basic URL formatting
                  onClick={() => setIsMenuOpen(false)}
                  className="font-['Poppins',_sans-serif] text-[18px] text-[#222] transition-colors hover:font-medium hover:text-[#001A4D]"
                >
                  {subItem}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}