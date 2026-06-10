import Image from 'next/image';

export default function BackedEarlySection() {
  const portfolio = [
    { id: 1, logo: '/images/logos/Shadowfax.svg', bg: '/images/portfolio/shadowfax_bg.webp', name: 'Shadowfax' },
    { id: 2, logo: '/images/logos/Credgenics.svg', bg: '/images/portfolio/credgenics_bg.webp', name: 'Credgenics' },
    { id: 3, logo: '/images/logos/ola.svg', bg: '/images/portfolio/ola_bg.webp', name: 'OLA' },
  ];

  return (
    <section 
      className="relative flex w-full flex-col items-center justify-center bg-[var(--background,#ffffff)] overflow-hidden"
      style={{
        marginTop: "var(--nav-height)",
        minHeight: "calc(100svh - var(--nav-height))",
        paddingTop: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
        // Applied the exact wide gutter variables used in your Hero & Footer
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      
      {/* Inner wrapper to match your global 1440px container width */}
      <div className="relative flex w-full max-w-[1440px] flex-col items-center mx-auto">
        
        {/* --- HEADING SECTION --- */}
        <div 
          className="flex flex-col items-center justify-center w-full"
          style={{ marginBottom: "clamp(32px, min(5vw, 7vh), 64px)" }}
        >
          <h2 className="text-[var(--primary-dark,#001A4D)] font-libre font-semibold text-[58px] leading-[110%] m-0 text-center">
            Backed Early.
          </h2>
          {/* Highlight Box */}
          <div className="flex flex-col justify-center items-center w-[408px] p-[10px] bg-[var(--home-btn-bg,#D3E2FF)] mt-2">
            <span className="text-[var(--primary-dark,#001A4D)] font-libre italic font-semibold text-[58px] leading-[110%] m-0 text-center">
              Built to last
            </span>
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {portfolio.map((item) => (
            <div 
              key={item.id} 
              className="relative w-full aspect-square rounded-[12px] overflow-hidden shadow-[0_0_14px_8px_rgba(166,166,166,0.25)] group"
            >
              {/* Next.js Optimized Background Image */}
              <Image 
                src={item.bg} 
                alt={`${item.name} background`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                priority={item.id <= 2}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Dark gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

              {/* Bleached White Logo Box */}
              <div className="absolute inset-x-0 bottom-8 flex justify-center items-center px-6">
                <div className="relative w-full max-w-[241px] aspect-[5/1]">
                  <Image 
                    src={item.logo} 
                    alt={`${item.name} logo`}
                    fill
                    className="object-contain brightness-0 invert pointer-events-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}