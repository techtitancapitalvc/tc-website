import Footer from "@/components/sections/Footer";
import BeyondTheChequeHero from "@/components/sections/BeyondTheChequeHero";
import { buildMetadata } from "@/sanity/lib/seo";
import BeyondTheChequeClient from "@/components/sections/BeyondTheChequeClient";

export async function generateMetadata() {
  return buildMetadata("titanSeedFund");
}

export default function TitanSeedFundPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <BeyondTheChequeHero />
      <BeyondTheChequeClient />
      <Footer />   
      {/* You can add your next sections below here later */}
    </main>
  );
}