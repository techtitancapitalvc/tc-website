import FifteenYears from "@/components/sections/FifteenYears";
import Footer from "@/components/sections/Footer";
import FundDetails from "@/components/sections/FundDetails";
import OriginStory from "@/components/sections/OriginStory";
import OurStoryHero from "@/components/sections/OurStoryHero";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("ourstory");
}

export default function OurStoryPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <OurStoryHero />
      <OriginStory />
      <FifteenYears />
      <FundDetails />
      <Footer />
    </main>
  );
}