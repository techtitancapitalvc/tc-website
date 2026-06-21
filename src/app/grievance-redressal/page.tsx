import LegalContent from "@/components/sections/LegalContent";
import Footer from "@/components/sections/Footer";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("grievance");
}

export default function GrievanceRedressalPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <LegalContent initialTab="grievance" />
      <Footer />
    </main>
  );
}
