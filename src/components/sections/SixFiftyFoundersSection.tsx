/**
 * SixFiftyFounders — server wrapper.
 *
 * The band had no data source at all: /foundersstory rendered the component
 * with no props, so it always fell back to a hard-coded heading and four local
 * photographs. This gives it the Sanity document it was always written for.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { sixFiftyFoundersQuery } from "@/sanity/lib/queries";
import SixFiftyFounders, {
  type SixFiftyFoundersData,
} from "./SixFiftyFounders";

async function getData(): Promise<SixFiftyFoundersData | null> {
  try {
    return await sanityFetch<SixFiftyFoundersData | null>({
      query: sixFiftyFoundersQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[SixFiftyFounders] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function SixFiftyFoundersSection() {
  return <SixFiftyFounders data={await getData()} />;
}
