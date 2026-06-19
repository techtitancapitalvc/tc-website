/**
 * WhatWeLookFor — server wrapper.
 *
 * Fetches the singleton "whatWeLookFor" document from Sanity and hands
 * the data to the existing presentational component. Falls back to
 * hardcoded defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: titanseedfund/page.tsx must import `WhatWeLookFor` from this
 * file, NOT from `./WhatWeLookForClient`. Importing the Client component
 * directly skips the Sanity fetch.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { whatWeLookForQuery } from "@/sanity/lib/queries";
import WhatWeLookForClient, {
  type WhatWeLookForData,
} from "./WhatWeLookForClient";

async function getWhatWeLookFor(): Promise<WhatWeLookForData | null> {
  try {
    return await sanityFetch<WhatWeLookForData | null>({
      query: whatWeLookForQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[WhatWeLookFor] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function WhatWeLookFor() {
  const data = await getWhatWeLookFor();
  return <WhatWeLookForClient data={data} />;
}
