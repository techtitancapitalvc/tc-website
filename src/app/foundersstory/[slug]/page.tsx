import Link from "next/link";

import Footer from "@/components/sections/Footer";
import FoundersStoryCTA from "@/components/sections/FoundersStoryCTA";
import {
  FounderStoryHeader,
  FounderStoryActs,
  FounderStoryToday,
  FounderStoryExplore,
  type FounderStoryPageData,
} from "@/components/sections/FounderStorySections";
import {
  FALLBACK_SLIDES,
  type FounderStory,
  type ImpactAtGlanceData,
} from "@/components/sections/ImpactAtGlanceClient";
import { sanityFetch } from "@/sanity/lib/client";
import {
  founderStoryPageBySlugQuery,
  founderStoryPageSlugsQuery,
  impactAtGlanceQuery,
} from "@/sanity/lib/queries";
import { buildMetadata } from "@/sanity/lib/seo";

/**
 * /foundersstory/[slug] — one page per company, entirely Sanity-driven.
 *
 * FOUR INDEPENDENT SECTIONS, each hidden when its content is empty. The page
 * renders all four unconditionally and lets each decide whether it belongs —
 * see the note at the top of FounderStorySections. So a story with no stats
 * simply has no blue band, with no branching here.
 *
 * If the slug matches no document the page 404s rather than silently serving
 * another company's story, which is what the previous hardcoded version did.
 */

export const revalidate = 60;

async function getStory(slug: string): Promise<FounderStoryPageData | null> {
  try {
    return await sanityFetch<FounderStoryPageData | null>({
      query: founderStoryPageBySlugQuery,
      params: { slug },
      revalidate: 60,
    });
  } catch (err) {
    console.error(`[founderStory] fetch failed for "${slug}":`, err);
    return null;
  }
}

/** The cards in the Explore band, reusing the shared founder-story list. */
async function getExploreStories(exclude?: string): Promise<FounderStory[]> {
  let slides: FounderStory[] = FALLBACK_SLIDES;
  try {
    const data = await sanityFetch<ImpactAtGlanceData | null>({
      query: impactAtGlanceQuery,
      revalidate: 60,
    });
    if (data?.founderStories?.length) slides = data.founderStories;
  } catch (err) {
    console.error("[founderStory] explore fetch failed, using fallback:", err);
  }
  // Never show the story you are already reading.
  const key = (exclude || "").toLowerCase();
  const rest = key
    ? slides.filter((s) => !`${s.role} ${s.name}`.toLowerCase().includes(key))
    : slides;
  return (rest.length >= 3 ? rest : slides).slice(0, 3);
}

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({
      query: founderStoryPageSlugsQuery,
      revalidate: 60,
    });
    return (slugs ?? []).map((slug) => ({ slug }));
  } catch {
    /* An empty list is safe: routes still render on demand. */
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("foundersstory");
  const story = await getStory(slug);
  if (!story) return base;
  return {
    ...base,
    title: story.headline || `The Story Of ${story.company}`,
    description: story.headline || base.description,
  };
}

export default async function FoundersStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    return (
      <main className="flex min-h-screen w-full flex-col bg-white">
        <section
          className="flex w-full flex-1 flex-col items-center justify-center text-center"
          style={{
            paddingTop: "calc(var(--nav-height) + var(--section-py))",
            paddingBottom: "var(--section-py)",
            paddingLeft: "var(--section-px-wide)",
            paddingRight: "var(--section-px-wide)",
            minHeight: "60svh",
          }}
        >
          <h1
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E]"
            style={{ fontSize: "clamp(24px, 3vw, 40px)", lineHeight: "140%" }}
          >
            This story isn&apos;t published yet.
          </h1>
          <Link
            href="/foundersstory"
            className="mt-[24px] font-['Poppins',_sans-serif] font-medium text-[#001A4D] underline underline-offset-4"
          >
            Back to founder stories
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const exploreStories = await getExploreStories(story.company);

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <FounderStoryHeader data={story} />
      <FounderStoryActs acts={story.acts} />
      <FounderStoryToday
        heading={story.todayHeading}
        stats={story.todayStats}
        footnote={story.todayFootnote}
      />
      <FounderStoryExplore
        heading={story.exploreHeading}
        browseLabel={story.exploreBrowseLabel}
        browseHref={story.exploreBrowseHref}
        stories={exploreStories}
      />

      <FoundersStoryCTA
        text="Every company above started with a single conversation. An idea, a problem, and a founder who was obsessed enough to not let it go. If you're building something real, we want to hear about it"
      />
      <Footer />
    </main>
  );
}
