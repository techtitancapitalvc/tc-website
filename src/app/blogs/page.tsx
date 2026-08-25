import BlogsHero from "@/components/sections/BlogsHero";
import Blogs from "@/components/sections/Blogs";
import Footer from "@/components/sections/Footer";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  // "blogs", not "getInvestment" — this page was serving the Get Investment
  // page's title and description to search engines and link previews.
  return buildMetadata("blogs");
}

export default function BlogsPage() {
  return (
    <>
      <main className="relative w-full p-0 m-0">
        <div className="relative z-[2] bg-white">
            <BlogsHero />
            <Blogs />
        </div>
        <div className="sticky bottom-0 z-0">
          <Footer />
        </div>
      </main>
    </>
  );
}
