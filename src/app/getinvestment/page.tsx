import Footer from "@/components/sections/Footer";
import GetInvestmentHero from "@/components/sections/GetInvestmentHero";
import GetInvestmentForm from "@/components/sections/GetInvestmentFormServer";
import GetInvestmentFAQ from "@/components/sections/GetInvestmentFAQ";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("getinvestment");
}

export default function GetInvestmentPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <GetInvestmentHero />
      <GetInvestmentForm />
      <GetInvestmentFAQ />
      <Footer />
    </main>
  );
}
