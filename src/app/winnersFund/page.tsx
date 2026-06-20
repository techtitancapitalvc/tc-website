import type { Metadata } from "next";
import Footer from "@/components/sections/Footer";
import WinnersHero from "@/components/sections/WinnersHero";
import AboutTheFund from "@/components/sections/AboutTheFund";
import PortfolioWinnerFund from "@/components/sections/PortfolioWinnerFund";
import FundDetails from "@/components/sections/FundDetails";

export const metadata: Metadata = {
  title: "Winners Fund",
  description:
    "Titan Capital Winners Fund — a SEBI-registered Category II AIF investing in high-growth portfolio companies.",
};

export default function TitanWinnersFundPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <WinnersHero />
      <AboutTheFund />
      <PortfolioWinnerFund />
      <FundDetails />
      <Footer />
    </main>
  );
}
