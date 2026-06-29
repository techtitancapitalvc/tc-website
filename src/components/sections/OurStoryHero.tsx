/**
 * OurStoryHero — server wrapper.
 *
 * Fetches the singleton "ourStoryHero" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults
 * inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import `OurStoryHero` from this file (the server
 * wrapper), NOT from `./OurStoryHeroClient`. Importing the Client
 * component directly skips the Sanity fetch and you'll get fallback
 * content on every page load.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { ourStoryHeroQuery } from "@/sanity/lib/queries";
import OurStoryHeroClient, {
  type OurStoryHeroData,
} from "./OurStoryHeroClient";

async function getOurStoryHero(): Promise<OurStoryHeroData | null> {
  try {
    return await sanityFetch<OurStoryHeroData | null>({
      query: ourStoryHeroQuery,
      revalidate: 60,
      tags: ["ourStoryHero"],
    });
  } catch (err) {
    console.error("[OurStoryHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function OurStoryHero() {
  const data = await getOurStoryHero();
  return <OurStoryHeroClient data={data} />;
}
