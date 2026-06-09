import BackedEarly from "@/components/sections/BackedEarly";
import Footer from "@/components/sections/Footer";
import PortfolioHero from "@/components/sections/PortfolioHero";

export default function PortfolioPage() {
    return (
      <main className="flex min-h-screen w-full flex-col">
        <BackedEarly /> 
        <Footer />   
        {/* You can add your next sections below here later */}
      </main>
    );
  }