/**
 * BackedBefore — server wrapper.
 *
 * Fetches the singleton "backedBefore" document from Sanity and hands the
 * data to the existing presentational component. Falls back to hardcoded
 * defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import `BackedBefore` from this file (the server
 * wrapper), NOT from `./BackedBeforeClient`. Importing the Client component
 * directly skips the Sanity fetch and you'll get fallback content on every
 * page load.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { winnersHeroQuery } from "@/sanity/lib/queries";
import WinnersHeroClient, {
  type WinnersHeroData,
} from "./WinnersHeroClient";

async function getBackedBefore(): Promise<WinnersHeroData | null> {
  try {
    return await sanityFetch<WinnersHeroData | null>({
      query: winnersHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[BackedBefore] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function BackedBefore() {
  const data = await getBackedBefore();
  return <WinnersHeroClient data={data} />;
}
