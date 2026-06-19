/**
 * AboutTheFund — server wrapper.
 *
 * Fetches the singleton "aboutTheFund" document from Sanity and hands the
 * data to the existing presentational component. Falls back to hardcoded
 * defaults inside the client if the fetch fails or returns null.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { aboutTheFundQuery } from "@/sanity/lib/queries";
import AboutTheFundClient, {
  type AboutTheFundData,
} from "./AboutTheFundClient";

async function getAboutTheFund(): Promise<AboutTheFundData | null> {
  try {
    return await sanityFetch<AboutTheFundData | null>({
      query: aboutTheFundQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[AboutTheFund] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function AboutTheFund() {
  const data = await getAboutTheFund();
  return <AboutTheFundClient data={data} />;
}
