import { sanityFetch } from "@/sanity/lib/client";
import { navbarQuery } from "@/sanity/lib/queries";
import NavbarClient, { type NavbarData } from "./NavbarClient";

/**
 * Server wrapper — pulls the Navbar singleton from Sanity, then hands it
 * to the interactive client component. If the doc is missing or empty the
 * client falls back to its hardcoded defaults so the site still works.
 */
export default async function Navbar() {
  const data = await sanityFetch<NavbarData | null>({
    query: navbarQuery,
    tags: ["navbar"],
  });
  return <NavbarClient data={data ?? undefined} />;
}
