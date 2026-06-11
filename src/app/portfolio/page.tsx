import type { Metadata } from "next";
import BackedEarly from "@/components/sections/BackedEarly";
import PortfolioStats from "@/components/sections/PortfolioStats";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import Footer from "@/components/sections/Footer";
import JoinPortfolioCTA from "@/components/sections/JoinPortfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Titan Capital's portfolio of 200+ companies including Razorpay, OLA, Urban Company, Mamaearth, and more.",
};

export default function PortfolioPage() {
    return (
      <main className="flex min-h-screen w-full flex-col">
        <BackedEarly />
        <PortfolioStats />
        <PortfolioGrid />
        <JoinPortfolioCTA />
        <Footer />
      </main>
    );
  }