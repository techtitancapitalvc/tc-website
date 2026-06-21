import BackedEarly from "@/components/sections/BackedEarly";
import PortfolioStats from "@/components/sections/PortfolioStats";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import Footer from "@/components/sections/Footer";
import JoinPortfolioCTA from "@/components/sections/JoinPortfolio";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("portfolio");
}

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