/**
 * OriginStory — server wrapper.
 *
 * Fetches the "originStory" singleton from Sanity and passes the data
 * to the interactive client component. Falls back to hardcoded
 * defaults if the fetch fails — a transient Sanity blip never crashes
 * the page.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { originStoryQuery } from "@/sanity/lib/queries";
import OriginStoryClient, {
  type OriginStoryData,
} from "./OriginStoryClient";

async function getOriginStory(): Promise<OriginStoryData | null> {
  try {
    return await sanityFetch<OriginStoryData | null>({
      query: originStoryQuery,
      tags: ["originStory"],
    });
  } catch (err) {
    console.error("[OriginStory] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function OriginStory() {
  const data = await getOriginStory();
  return <OriginStoryClient data={data} />;
}
