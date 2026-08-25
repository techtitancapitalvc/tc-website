/**
 * FoundersStoryHero — server wrapper.
 *
 * Fetches the singleton "foundersStoryHero" document and hands it to the
 * client. The hero is its OWN document, separate from "Founders Story Page"
 * which holds every story, so the headline and the row of portraits can be
 * edited without opening the story list.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./FoundersStoryHeroClient`.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { foundersStoryHeroQuery } from "@/sanity/lib/queries";
import FoundersStoryHeroClient, {
  type FoundersStoryHeroData,
} from "./FoundersStoryHeroClient";

async function getFoundersStoryHero(): Promise<FoundersStoryHeroData | null> {
  try {
    return await sanityFetch<FoundersStoryHeroData | null>({
      query: foundersStoryHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FoundersStoryHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FoundersStoryHero() {
  const data = await getFoundersStoryHero();
  return <FoundersStoryHeroClient data={data} />;
}
