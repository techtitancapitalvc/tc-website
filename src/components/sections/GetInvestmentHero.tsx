/**
 * GetInvestmentHero — server wrapper.
 *
 * Fetches the singleton "getInvestmentHero" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults inside
 * the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { getInvestmentHeroQuery } from "@/sanity/lib/queries";
import GetInvestmentHeroClient, {
  type GetInvestmentHeroData,
} from "./GetInvestmentHeroClient";

async function getGetInvestmentHero(): Promise<GetInvestmentHeroData | null> {
  try {
    return await sanityFetch<GetInvestmentHeroData | null>({
      query: getInvestmentHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[GetInvestmentHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function GetInvestmentHero() {
  const data = await getGetInvestmentHero();
  return <GetInvestmentHeroClient data={data} />;
}
