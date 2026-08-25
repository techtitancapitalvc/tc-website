/**
 * BlogsHero — server wrapper.
 *
 * Fetches the singleton "blogsHero" document and hands it to the client. The
 * hero is its OWN document, separate from "Blogs Page" which holds every post,
 * so the headline can be edited without opening the post list.
 *
 * NOTE: page.tsx must import this file (the server wrapper), NOT
 * `./BlogsHeroClient`. Importing the client directly skips the Sanity fetch
 * and you always get the fallback copy.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { blogsHeroQuery } from "@/sanity/lib/queries";
import BlogsHeroClient, { type BlogsHeroData } from "./BlogsHeroClient";

async function getBlogsHero(): Promise<BlogsHeroData | null> {
  try {
    return await sanityFetch<BlogsHeroData | null>({
      query: blogsHeroQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[BlogsHero] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function BlogsHero() {
  const data = await getBlogsHero();
  return <BlogsHeroClient data={data} />;
}
