/**
 * TitanEcosystemHero — server wrapper.
 *
 * Fetches the singleton "titanEcosystemHero" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./TitanEcosystemHeroClient`. Importing the Client directly skips the Sanity
 * fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { titanEcosystemHeroQuery } from "@/sanity/lib/queries";
import TitanEcosystemHeroClient, {
  type TitanEcosystemHeroData,
} from "./TitanEcosystemHeroClient";

async function getTitanEcosystemHero(): Promise<TitanEcosystemHeroData | null> {
  try {
    return await sanityFetch<TitanEcosystemHeroData | null>({
      query: titanEcosystemHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error(
      "[TitanEcosystemHero] Sanity fetch failed, using fallback:",
      err
    );
    return null;
  }
}

export default async function TitanEcosystemHero() {
  const data = await getTitanEcosystemHero();
  return <TitanEcosystemHeroClient data={data} />;
}
