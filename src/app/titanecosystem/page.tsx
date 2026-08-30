import Footer from "@/components/sections/Footer";
import TitanEcosystemHero from "@/components/sections/TitanEcosystemHero";
import TitanEcosystemPillars from "@/components/sections/TitanEcosystemPillars";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("titanEcosystem");
}

export default function TitanEcosystemPage() {
  return (
    <main className="relative w-full p-0 m-0">
      <div className="relative z-[2] bg-white">
        <TitanEcosystemHero />
        <TitanEcosystemPillars />
      </div>
      <div className="sticky bottom-0 z-0">
        <Footer />
      </div>
    </main>
  );
}
