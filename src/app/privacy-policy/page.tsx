import type { Metadata } from "next";
import LegalContent from "@/components/sections/LegalContent";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the privacy policy of Titan Winners Fund Management LLP — how we collect, use and disclose information provided by users of the Titan Capital website.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <LegalContent initialTab="privacy" />
      <Footer />
    </main>
  );
}
