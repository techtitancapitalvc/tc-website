/**
 * OurTeam — server wrapper.
 *
 * Fetches the "ourTeam" singleton from Sanity and passes the data
 * to the interactive client component. Wrapped in try/catch so a
 * transient Sanity blip never crashes the page — falls through to
 * hardcoded defaults inside the client.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { ourTeamQuery } from "@/sanity/lib/queries";
import OurTeamClient, { type OurTeamData } from "./OurTeamClient";

async function getOurTeam(): Promise<OurTeamData | null> {
  try {
    return await sanityFetch<OurTeamData | null>({
      query: ourTeamQuery,
      tags: ["ourTeam"],
    });
  } catch (err) {
    console.error("[OurTeam] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function OurTeam() {
  const data = await getOurTeam();
  return <OurTeamClient data={data} />;
}
