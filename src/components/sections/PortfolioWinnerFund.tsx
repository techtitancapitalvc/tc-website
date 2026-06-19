/**
 * PortfolioWinnerFund — server wrapper.
 *
 * Fetches the singleton "portfolioWinnerFund" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { portfolioWinnerFundQuery } from "@/sanity/lib/queries";
import PortfolioWinnerFundClient, {
  type PortfolioWinnerFundData,
} from "./PortfolioWinnerFundClient";

async function getPortfolioWinnerFund(): Promise<PortfolioWinnerFundData | null> {
  try {
    return await sanityFetch<PortfolioWinnerFundData | null>({
      query: portfolioWinnerFundQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[PortfolioWinnerFund] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function PortfolioWinnerFund() {
  const data = await getPortfolioWinnerFund();
  return <PortfolioWinnerFundClient data={data} />;
}
