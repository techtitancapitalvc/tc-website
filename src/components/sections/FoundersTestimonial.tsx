"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

// Updated data with all 5 founders and their quotes
const testimonials = [
  {
    id: 1,
    name: "Abhiraj Bahl",
    role: "Cofounder, Urban Company",
    image: "/images/hero_founders_images/abhiraj_bahl.jpeg",
    text: "“Kunal and Rohit were the first investors to believe in Urban Company, even before we launched the platform or decided on the name. Their unwavering support has been a constant throughout our journey, guiding us through ups and downs. As Founders, we deeply value their mentorship and friendship. An early-stage company couldn’t ask for better partners than Titan Capital.”",
  },
  {
    id: 2,
    name: "Disha Singh",
    role: "Cofounder, Zouk",
    image: "/images/Testimonials/disha-singh.avif",
    text: "“Titan Capital has been an invaluable partner in our journey to build Zouk. Kunal and Rohit have consistently provided invaluable guidance on cultivating a long-lasting business with strong brand loyalty. Their counsel has been instrumental in guiding our focus on critical areas such as efficient working capital management, deep category penetration, and developing a sustainable competitive advantage. Furthermore, they have emphasized the importance of closely monitoring Net Promoter Score (NPS) as a key indicator of brand love.”",
  },
  {
    id: 3,
    name: "Rishabh Goel",
    role: "Cofounder, Credgenics",
    image: "/images/Testimonials/Rishabh.jpeg",
    text: "“Titan Capital has been more than just an investor for Credgenics - they’ve been our first partner in this journey. Our early conversations made it clear that they weren’t your typical investors. Despite us venturing into a relatively complex and niche segment of debt collections, they backed us with insights and shared perspectives that reshaped how we approached the key challenges. Their belief in Credgenics wasn’t just about the numbers; it was about the vision and the potential to make an impact towards the financial health of the country.”",
  },
  {
    id: 4,
    name: "Raghu Ravinutala",
    role: "Cofounder, Yellow.ai",
    image: "/images/Testimonials/Raghu-Ravinutala.webp", // Adjust image path as needed
    text: "“Titan Capital is truly ‘founder only’. From the first interaction, I was very overwhelmed with their focus on making the founder successful beyond anything. They were always there as a great sounding board whenever we had to make critical decisions. I always felt Titan Capital had our back whatever is the situation and that's a great support an early-stage founder can have.”",
  },
  {
    id: 5,
    name: "Aarti Gill",
    role: "Cofounder, OZiva",
    image: "/images/Testimonials/Aarti Gill.png", // Adjust image path as needed
    text: "“When I first met Kunal, I wasn’t even considering raising equity capital - but that one conversation completely changed my perspective. Partnering with Titan Capital was one of the best decisions we made at OZiva. With Kunal’s guidance, I learned not just business strategies like fundraising, negotiation, and stakeholder management, but also invaluable life lessons about balancing family and work. Thanks to Kunal, Rohit, and the Titan team.”",
  },
];

export default function FounderTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);

//   // 1. Auto-play interval: Changes carousel slide every 4 seconds
//   useEffect(() => {
//     const slideTimer = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//     }, 4000);
//     return () => clearInterval(slideTimer);
//   }, []);

  // 2. Random Flip interval: Picks a random card to flip every 6 seconds
  useEffect(() => {
    const flipTimer = setInterval(() => {
      setFlippedCardId((prevId) => {
        let nextId;
        // Ensure we pick a DIFFERENT card to flip so it feels dynamic
        do {
          nextId = testimonials[Math.floor(Math.random() * testimonials.length)].id;
        } while (nextId === prevId);
        return nextId;
      });
    }, 6000); 
    return () => clearInterval(flipTimer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // =========================================
  // HEADING VARIANTS
  // =========================================
  const text1Variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const text2Variants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.6 } }
  };

  const highlightVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 1.1 } }
  };

  return (
    <section className="flex flex-col overflow-hidden bg-white pt-[clamp(50px,8vw,100px)]">
      {/* Top Header Row */}
      <div className="mx-auto mb-10 flex w-full max-w-[1280px] flex-col items-start justify-between gap-6 px-5 md:mb-16 md:flex-row md:items-end md:px-10">
        
        <motion.div 
          className="flex flex-col items-start gap-1 md:gap-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* STEP 1: Top text slides up (Normal font-style) */}
          <motion.h2 
            className="m-0 font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-semibold leading-[1.2] text-[#001A4D]" 
            variants={text1Variants}
          >
            What our
          </motion.h2>
          
          {/* STEP 2: Bottom text slides up (Italicized) */}
          <motion.h2 
            className="m-0 font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-semibold italic leading-[1.2] text-[#001A4D]" 
            variants={text2Variants}
          >
            <span className="relative inline-block overflow-hidden px-2 md:px-4" style={{ background: "transparent" }}>
              {/* STEP 3: The Blue Highlight sweeps */}
              <motion.span
                className="absolute inset-0 z-0 bg-[#D3E2FF]"
                style={{ transformOrigin: "left" }}
                variants={highlightVariants}
              />
              <span className="relative z-10">founders say</span>
            </span>
          </motion.h2>
        </motion.div>

        {/* Carousel Arrow Buttons */}
        <div className="flex items-center gap-4 md:mb-4">
          <button 
            onClick={prevSlide}
            className="flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full border-none bg-[#D3E2FF] transition hover:opacity-80 md:h-[77px] md:w-[77px]"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-auto md:w-auto" width="59" height="59" viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full border-none bg-[#D3E2FF] transition hover:opacity-80 md:h-[77px] md:w-[77px]"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 rotate-180 md:h-auto md:w-auto" width="59" height="59" viewBox="0 0 59 59" fill="none">
              <path d="M27.1151 20.9695C27.2962 20.8007 27.4415 20.5972 27.5423 20.371C27.6431 20.1448 27.6973 19.9007 27.7016 19.6531C27.706 19.4056 27.6605 19.1597 27.5677 18.9301C27.475 18.7005 27.337 18.492 27.1619 18.3169C26.9868 18.1418 26.7783 18.0038 26.5487 17.911C26.3191 17.8183 26.0732 17.7728 25.8256 17.7771C25.5781 17.7815 25.3339 17.8357 25.1078 17.9365C24.8816 18.0372 24.6781 18.1825 24.5093 18.3637L14.6759 28.197C14.3307 28.5427 14.1367 29.0113 14.1367 29.4999C14.1367 29.9885 14.3307 30.4571 14.6759 30.8028L24.5093 40.6362C24.6781 40.8173 24.8816 40.9626 25.1078 41.0634C25.3339 41.1642 25.5781 41.2183 25.8256 41.2227C26.0732 41.2271 26.3191 41.1815 26.5487 41.0888C26.7783 40.9961 26.9868 40.8581 27.1619 40.683C27.337 40.5079 27.475 40.2994 27.5677 40.0698C27.6605 39.8402 27.706 39.5943 27.7016 39.3467C27.6973 39.0992 27.6431 38.855 27.5423 38.6289C27.4415 38.4027 27.2962 38.1991 27.1151 38.0303L20.4284 31.3437H44.2497C44.7387 31.3437 45.2076 31.1494 45.5534 30.8037C45.8992 30.4579 46.0934 29.9889 46.0934 29.4999C46.0934 29.0109 45.8992 28.542 45.5534 28.1962C45.2076 27.8504 44.7387 27.6562 44.2497 27.6562H20.4284L27.1151 20.9695Z" fill="black"/>
            </svg>
          </button>
        </div>
      </div>

      {/* =========================================
          AUTO-CAROUSEL TRACK WITH 3D FLIP CARDS
          ========================================= */}
      <div className="w-full overflow-hidden px-5 pb-10 md:px-10 lg:px-[calc((100vw-1280px)/2+40px)]">
        <motion.div 
          className="flex w-max gap-6"
          animate={{ x: -(currentIndex * 335.424) }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {testimonials.map((item) => {
            const isFlipped = flippedCardId === item.id;

            return (
              // Perspective wrapper for the 3D flip effect
              <div 
                key={item.id} 
                className="relative h-[370.703px] w-[311.424px] shrink-0" 
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  className="relative h-full w-full"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  
                  {/* --- FRONT SIDE (IMAGE) --- */}
                  <div 
                    className="absolute inset-0 flex h-full w-full flex-col justify-end overflow-hidden rounded-[12px]"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Image
                      src={item.image || ""}
                      alt={item.name}
                      fill
                      sizes="311px"
                      className="object-cover"
                    />
                    {/* Exact Gradient overlay requested */}
                    <div className="absolute inset-0 z-[5] mix-blend-multiply" />
                    
                    {/* Content positioned above the gradient */}
                    <div className="relative z-10 flex flex-col p-6 drop-shadow-md">
                      <p className="m-0 font-['Libre_Baskerville',_serif] text-xl font-bold text-white">{item.name}</p>
                      <p className="m-0 mt-1 font-['Poppins',_sans-serif] text-[13px] font-light text-white">{item.role}</p>
                    </div>
                  </div>

                  {/* --- BACK SIDE (QUOTE) --- */}
                  <div 
                    className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[12px] bg-[#C8DBFF] p-6 shadow-lg"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    {/* Scaled text down slightly and tightened leading so longer quotes fit gracefully */}
                    <p className="m-0 font-['Inter',_sans-serif] text-[12px] font-medium leading-[1.6] text-[#001A4D]">
                      {item.text}
                    </p>
                    <div className="flex flex-col pt-4">
                      <p className="m-0 font-['Libre_Baskerville',_serif] text-lg font-bold text-[#001A4D]">{item.name}</p>
                      <p className="m-0 mt-1 font-['Poppins',_sans-serif] text-[12px] font-medium text-[#001A4D]">{item.role}</p>
                    </div>
                  </div>

                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* =========================================
          ANIMATED HEADING 2: We're listening
          ========================================= */}
      <div className="mt-8 flex w-full flex-col items-center justify-center gap-8 rounded-t-[40px] bg-[#FBF7F0] px-5 py-12 md:mt-12 md:gap-10 md:px-10 md:py-24">
        
        <motion.div 
          className="flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* STEP 1: Text slides up (Now with italic and text-center applied) */}
          <motion.h2 
            className="m-0 text-center font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-semibold italic leading-[1.2] text-[#001A4D]" 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
          >
            <span className="relative inline-block overflow-hidden px-2 md:px-6" style={{ background: "transparent" }}>
               <motion.span 
                 className="absolute inset-0 z-0 bg-[#D3E2FF]" 
                 style={{ transformOrigin: "left" }} 
                 variants={{
                   hidden: { scaleX: 0 },
                   visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut", delay: 0.6 } }
                 }} 
               />
               <span className="relative z-10">We're listening.</span>
            </span>
          </motion.h2>
          
          {/* STEP 2: Bottom text slides up (Normal font style, 600 weight) */}
          <motion.h2 
            className="m-0 mt-2 w-full max-w-[858px] text-center font-['Libre_Baskerville',_serif] text-[clamp(40px,6vw,80px)] font-semibold leading-[1.2] text-[#001A4D]" 
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 1.1 } }
            }}
          >
            Tell us what you're building.
          </motion.h2>
        </motion.div>

        <button className="flex h-[70px] w-full max-w-[379px] cursor-pointer items-center justify-center rounded-xl border-none bg-[#001A4D] px-4 font-['Libre_Baskerville',_serif] text-[clamp(24px,3vw,32px)] font-semibold leading-[1.07] text-[#F5F0E8] transition hover:opacity-90 md:h-[90px]">
          Get Investment Now
        </button>
      </div>
    </section>
  );
}