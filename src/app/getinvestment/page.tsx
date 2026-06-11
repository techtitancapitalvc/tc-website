import type { Metadata } from "next";
import Footer from "@/components/sections/Footer";
import GetInvestmentHero from "@/components/sections/GetInvestmentHero";
import GetInvestmentForm from "@/components/sections/GetInvestmentForm";
import GetInvestmentFAQ from "@/components/sections/GetInvestmentFAQ";

export const metadata: Metadata = {
  title: "Get Investment",
  description:
    "Apply for early stage funding from Titan Capital. Submit your pitch and connect with Kunal Bahl & Rohit Bansal.",
};

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
