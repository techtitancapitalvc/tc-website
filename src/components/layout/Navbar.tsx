import { sanityFetch } from "@/sanity/lib/client";
import { navbarQuery } from "@/sanity/lib/queries";
import NavbarClient, { type NavbarData } from "./NavbarClient";

/**
 * Server wrapper — pulls the Navbar singleton from Sanity, then hands it
 * to the interactive client component. If the fetch fails (network blip,
 * Sanity outage, missing doc) the client falls back to its hardcoded
 * defaults so the site still renders. We never want a single CMS fetch
 * to crash every page on the site.
 */
export default async function Navbar() {
  let data: NavbarData | null = null;
  try {
    data = await sanityFetch<NavbarData | null>({
      query: navbarQuery,
      tags: ["navbar"],
    });
  } catch (err) {
    console.error("[Navbar] Sanity fetch failed, using fallback:", err);
  }
  return <NavbarClient data={data ?? undefined} />;
}
