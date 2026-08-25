/**
 * Blogs — server wrapper.
 *
 * Fetches every post out of the single "Blogs Page" document and hands them to
 * the listing, in the array order the editor set. Falls back to the client's
 * placeholders when the fetch fails or returns nothing, so the page is never
 * an empty shell.
 *
 * NOTE: page.tsx must import this file, NOT `./BlogsClient`. Importing the
 * client directly skips the fetch and you always get placeholders.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { allBlogPostsQuery } from "@/sanity/lib/queries";
import BlogsClient, { type BlogPostCard } from "./BlogsClient";

async function getPosts(): Promise<BlogPostCard[] | null> {
  try {
    return await sanityFetch<BlogPostCard[] | null>({
      query: allBlogPostsQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[Blogs] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function Blogs() {
  const posts = await getPosts();
  return <BlogsClient posts={posts} />;
}
