/**
 * WhyTitanSeed — server wrapper.
 *
 * Fetches the singleton "whyTitanSeed" document from Sanity and hands
 * the data to the existing presentational component (cluster→spread
 * card animation). Falls back to hardcoded defaults inside the client
 * if the fetch fails or returns null.
 *
 * NOTE: titanseedfund/page.tsx must import `WhyTitanSeed` from this
 * file, NOT from `./WhyTitanSeedClient`. Importing the Client component
 * directly skips the Sanity fetch.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { whyTitanSeedQuery } from "@/sanity/lib/queries";
import WhyTitanSeedClient, {
  type WhyTitanSeedData,
} from "./WhyTitanSeedClient";

async function getWhyTitanSeed(): Promise<WhyTitanSeedData | null> {
  try {
    return await sanityFetch<WhyTitanSeedData | null>({
      query: whyTitanSeedQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[WhyTitanSeed] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function WhyTitanSeed() {
  const data = await getWhyTitanSeed();
  return <WhyTitanSeedClient data={data} />;
}
