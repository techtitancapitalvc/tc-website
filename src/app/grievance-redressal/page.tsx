import type { Metadata } from "next";
import LegalContent from "@/components/sections/LegalContent";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Grievance Redressal",
  description:
    "Titan Capital's grievance redressal mechanism — escalation channels, SEBI SCORES, ODR, and fund-level details for Winners Fund I and II.",
};

export default function GrievanceRedressalPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <LegalContent initialTab="grievance" />
      <Footer />
    </main>
  );
}
