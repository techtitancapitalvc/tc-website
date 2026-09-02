/**
 * FoundersStory — server wrapper for the grid on /foundersstory.
 *
 * IT NO LONGER READS THE HOME PAGE'S SINGLETON. This used to fetch
 * `impactAtGlanceQuery`, so /foundersstory and the home page shared one story
 * list, one heading and one CTA label — editing either changed both. It now
 * reads its own `foundersStoryGrid` document.
 *
 * The fallback is still the home page's FALLBACK_SLIDES: those are hard-coded
 * demo cards, not content, so sharing them costs nothing and keeps the grid
 * from rendering empty before the new document is filled in.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { foundersStoryGridQuery } from "@/sanity/lib/queries";
import { FALLBACK_SLIDES } from "./ImpactAtGlanceClient";
import FoundersStoryGrid from "./FoundersStoryGrid";
import type { FoundersStoryGridData } from "@/lib/founderStory";

async function getData(): Promise<FoundersStoryGridData | null> {
  try {
    return await sanityFetch<FoundersStoryGridData | null>({
      query: foundersStoryGridQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[FoundersStory] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function FoundersStory() {
  const data = await getData();

  const slides =
    data?.stories && data.stories.length > 0 ? data.stories : FALLBACK_SLIDES;

  return (
    <FoundersStoryGrid
      heading={data?.gridHeading || "Founder Stories"}
      ctaLabel={data?.ctaLabel || "See More"}
      slides={slides}
    />
  );
}
