import Footer from "@/components/sections/Footer";
import GetInvestmentHero from "@/components/sections/GetInvestmentHero";
import GetInvestmentForm from "@/components/sections/GetInvestmentForm";
import GetInvestmentFAQ from "@/components/sections/GetInvestmentFAQ";

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
