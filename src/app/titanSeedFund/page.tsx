import type { Metadata } from "next";
import Footer from "@/components/sections/Footer";
import TitanSeedHero from "@/components/sections/TitanSeedHero";
import WhatWeLookFor from "@/components/sections/WhatWeLookFor";
import WhyTitanSeed from "@/components/sections/WhyTitanSeed";

export const metadata: Metadata = {
  title: "Titan Seed Fund",
  description:
    "Titan Seed Fund backs exceptional founders at the earliest stages. Learn what we look for and why founders choose Titan.",
};

export default function TitanSeedFundPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <TitanSeedHero />
      <WhyTitanSeed />
      <WhatWeLookFor />
      <Footer />   
      {/* You can add your next sections below here later */}
    </main>
  );
}