/**
 * GetInvestmentFormServer — server wrapper.
 *
 * Fetches the singleton "getInvestmentForm" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { getInvestmentFormQuery } from "@/sanity/lib/queries";
import GetInvestmentForm, {
  type GetInvestmentFormData,
} from "./GetInvestmentForm";

async function getFormData(): Promise<GetInvestmentFormData | null> {
  try {
    return await sanityFetch<GetInvestmentFormData | null>({
      query: getInvestmentFormQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[GetInvestmentForm] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function GetInvestmentFormServer() {
  const data = await getFormData();
  return <GetInvestmentForm data={data} />;
}
