/**
 * TitanSeedHero — server wrapper.
 *
 * Fetches the singleton "titanSeedHero" document from Sanity and hands
 * the data to the existing presentational component. Falls back to
 * hardcoded defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: titanseedfund/page.tsx must import `TitanSeedHero` from this file
 * (the server wrapper), NOT from `./TitanSeedHeroClient`. Importing the
 * Client component directly skips the Sanity fetch.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { beyondTheChequeHeroQuery } from "@/sanity/lib/queries";

import BeyondTheChequeHeroClient, { BeyondTheChequeHeroData } from "./BeyondTheChequeHeroClient";

async function getBeyondTheChequeHero(): Promise<BeyondTheChequeHeroData | null> {
  try {
    return await sanityFetch<BeyondTheChequeHeroData | null>({
      query: beyondTheChequeHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[TitanSeedHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function BeyondTheChequeHero() {
  const data = await getBeyondTheChequeHero();
  return <BeyondTheChequeHeroClient data={data} />;
}
