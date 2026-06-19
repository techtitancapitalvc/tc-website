/**
 * FundDetails — server wrapper.
 *
 * Fetches the singleton "fundDetails" document from Sanity and hands the
 * data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { fundDetailsQuery } from "@/sanity/lib/queries";
import FundDetailsClient, {
  type FundDetailsData,
} from "./FundDetailsClient";

async function getFundDetails(): Promise<FundDetailsData | null> {
  try {
    return await sanityFetch<FundDetailsData | null>({
      query: fundDetailsQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FundDetails] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FundDetails() {
  const data = await getFundDetails();
  return <FundDetailsClient data={data} />;
}
