/**
 * LedByFounders — server wrapper.
 *
 * Fetches the singleton "ledByFounders" document from Sanity and hands
 * the data to the client component. Falls back to hardcoded defaults
 * inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./LedByFoundersClient`. Importing the Client directly skips the
 * Sanity fetch and you'll always get the fallback content.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { ledByFoundersQuery } from "@/sanity/lib/queries";
import LedByFoundersClient, {
  type LedByFoundersData,
} from "./LedByFoundersClient";

async function getLedByFounders(): Promise<LedByFoundersData | null> {
  try {
    return await sanityFetch<LedByFoundersData | null>({
      query: ledByFoundersQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[LedByFounders] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function LedByFounders() {
  const data = await getLedByFounders();
  return <LedByFoundersClient data={data} />;
}
