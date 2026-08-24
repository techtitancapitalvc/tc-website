/**
 * TitanEcosystemPillars — server wrapper.
 *
 * Fetches the singleton "titanEcosystemPillars" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./TitanEcosystemPillarsClient`. Importing the Client directly skips the
 * Sanity fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { titanEcosystemPillarsQuery } from "@/sanity/lib/queries";
import TitanEcosystemPillarsClient, {
  type TitanEcosystemPillarsData,
} from "./TitanEcosystemPillarsClient";

async function getPillars(): Promise<TitanEcosystemPillarsData | null> {
  try {
    return await sanityFetch<TitanEcosystemPillarsData | null>({
      query: titanEcosystemPillarsQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error(
      "[TitanEcosystemPillars] Sanity fetch failed, using fallback:",
      err
    );
    return null;
  }
}

export default async function TitanEcosystemPillars() {
  const data = await getPillars();
  return <TitanEcosystemPillarsClient data={data} />;
}
