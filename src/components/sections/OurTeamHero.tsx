import { sanityFetch } from "@/sanity/lib/client";
import { ourTeamHeroQuery } from "@/sanity/lib/queries";
import OurTeamHeroClient, { type OurTeamHeroData } from "./OurTeamHeroClient";

async function getOurTeam(): Promise<OurTeamHeroData | null> {
  try {
    return await sanityFetch<OurTeamHeroData | null>({
      query: ourTeamHeroQuery,
      revalidate: 60, // ISR cache
    });
  } catch (err) {
    console.error("[OurTeam] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function OurTeamPage() {
  const data = await getOurTeam();
  return <OurTeamHeroClient data={data} />;
}