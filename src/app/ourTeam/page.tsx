import Footer from "@/components/sections/Footer";
import LedByFoundersPage from "@/components/sections/LedByFounders";
import OurTeam from "@/components/sections/OurTeam";
import OurTeamHero from "@/components/sections/OurTeamHero";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("ourteam");
}

export default function OurTeamPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <OurTeamHero />
      <LedByFoundersPage />
      <OurTeam />
      <Footer />
    </main>
  );
}