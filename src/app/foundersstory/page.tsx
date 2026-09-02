import Footer from "@/components/sections/Footer";
import FoundersStoryHero from "@/components/sections/FoundersStoryHero";
import FoundersStory from "@/components/sections/FoundersStory";
import FeaturedStory from "@/components/sections/FeaturedStory";
import SixFiftyFounders from "@/components/sections/SixFiftyFounders";
import JoinPortfolio from "@/components/sections/JoinPortfolio";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("foundersstory");
}

export default function FoundersStoryPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <FoundersStoryHero />
      <FeaturedStory />
      <FoundersStory />
      <SixFiftyFounders />
      <Footer />
    </main>
  );
}
