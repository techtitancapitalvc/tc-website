/**
 * FifteenYears — server wrapper.
 *
 * Fetches the "fifteenYears" singleton from Sanity and passes the data
 * to the interactive client component. Wrapped in try/catch so a
 * transient Sanity blip never crashes the page — falls through to
 * hardcoded defaults inside the client.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { fifteenYearsQuery } from "@/sanity/lib/queries";
import FifteenYearsClient, {
  type FifteenYearsData,
} from "./FifteenYearsClient";

async function getFifteenYears(): Promise<FifteenYearsData | null> {
  try {
    return await sanityFetch<FifteenYearsData | null>({
      query: fifteenYearsQuery,
      tags: ["fifteenYears"],
    });
  } catch (err) {
    console.error("[FifteenYears] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FifteenYears() {
  const data = await getFifteenYears();
  return <FifteenYearsClient data={data} />;
}
