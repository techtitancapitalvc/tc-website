import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/sections/Footer";
import { sanityFetch } from "@/sanity/lib/client";
import {
  allTeamMemberSlugsQuery,
  teamMemberBySlugQuery,
} from "@/sanity/lib/queries";
import { buildMetadata } from "@/sanity/lib/seo";

import type { TeamMember } from "@/components/sections/OurTeamClient";

/* ─────────────────────────────────────────────────────────
   Pre-render every member's detail page at build time so
   slug routes work out of the box. Build-time only — the
   ISR cache on the GROQ fetch keeps content fresh after.
   ───────────────────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[] | null>({
      query: allTeamMemberSlugsQuery,
      tags: ["ourTeam"],
    });
    return (slugs || []).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("ourteam");
  const member = await getMember(slug);
  if (!member) return base;
  return {
    ...base,
    title: `${member.name} — ${member.title}`,
    description: member.bio?.slice(0, 160) || base.description,
  };
}

async function getMember(slug: string): Promise<TeamMember | null> {
  try {
    return await sanityFetch<TeamMember | null>({
      query: teamMemberBySlugQuery,
      params: { slug },
      tags: ["ourTeam", `ourTeam:${slug}`],
    });
  } catch (err) {
    console.error("[ourteam/[slug]] Sanity fetch failed:", err);
    return null;
  }
}

function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Detail page — large photo on a blob, name, title, bio,
   social icons, and a Back link.
   ───────────────────────────────────────────────────────── */
export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMember(slug);
  if (!member) notFound();

  const emailHref =
    member.emailUrl &&
    (member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`);

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <section
        className="relative flex w-full flex-col items-center"
        style={{
          marginTop: "var(--nav-height)",
          paddingTop: "clamp(40px, min(5vw, 7vh), 100px)",
          paddingBottom: "clamp(48px, min(6vw, 9vh), 120px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[1100px] flex-col items-start"
          style={{ gap: "clamp(28px, min(3vw, 4.5vh), 56px)" }}
        >
          {/* Back link */}
          <Link
            href="/ourteam"
            className="inline-flex items-center gap-2 font-['Poppins',_sans-serif] text-[#001A4D] transition-opacity hover:opacity-70"
            style={{ fontSize: "clamp(14px, 1.2vw, 18px)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12L12 5M5 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to team
          </Link>

          {/* Photo + details, two columns on desktop */}
          <div
            className="flex w-full flex-col items-center gap-[clamp(28px,3vw,56px)] lg:flex-row lg:items-start"
          >
            {/* Photo with blob bg (same shape we use in the cards) */}
            <div className="relative shrink-0">
              <div
                className="relative"
                style={{
                  width: "clamp(220px, min(28vw, 41vh), 400px)",
                  aspectRatio: "254 / 250",
                }}
              >
                <svg
                  viewBox="0 0 254 250"
                  fill="none"
                  aria-hidden
                  className="absolute h-full w-full"
                  style={{ top: "6%", left: "5%" }}
                >
                  <path
                    d="M198 18 C234 32 252 88 244 142 C236 196 198 234 144 240 C90 246 38 230 16 188 C-6 144 6 92 32 58 C58 24 102 6 148 8 C170 9 184 12 198 18 Z"
                    fill="#D3E2FF"
                  />
                </svg>
                {member.image && (
                  <Image
                    src={cdnImageSrc(member.image, 900)}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 60vw, 400px"
                    priority
                    className="object-cover"
                    style={{ clipPath: "url(#our-team-blob-clip-0)" }}
                  />
                )}
                {/* Inline clip-path def so this page doesn't depend on
                    the section client being mounted. */}
                <svg
                  aria-hidden
                  width="0"
                  height="0"
                  style={{ position: "absolute", pointerEvents: "none" }}
                >
                  <defs>
                    <clipPath
                      id="our-team-blob-clip-0"
                      clipPathUnits="objectBoundingBox"
                    >
                      <path
                        d="M198 18 C234 32 252 88 244 142 C236 196 198 234 144 240 C90 246 38 230 16 188 C-6 144 6 92 32 58 C58 24 102 6 148 8 C170 9 184 12 198 18 Z"
                        transform={`scale(${1 / 254} ${1 / 250})`}
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="flex w-full flex-col">
              <h1
                className="m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
                style={{
                  fontSize: "clamp(28px, min(4vw, 5.9vh), 56px)",
                  lineHeight: "120%",
                }}
              >
                {member.name}
              </h1>
              <p
                className="m-0 font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
                style={{
                  fontSize: "clamp(15px, min(1.67vw, 2.44vh), 24px)",
                  lineHeight: "158%",
                  marginTop: "clamp(8px, min(0.8vw, 1.2vh), 16px)",
                }}
              >
                {member.title}
              </p>

              {member.bio && (
                <p
                  className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]"
                  style={{
                    fontSize: "clamp(14px, min(1.4vw, 2vh), 20px)",
                    lineHeight: "165%",
                    marginTop: "clamp(20px, min(2vw, 3vh), 36px)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {member.bio}
                </p>
              )}

              {(member.linkedinUrl || emailHref || member.twitterUrl) && (
                <div
                  className="flex items-center"
                  style={{
                    gap: "clamp(10px, min(1vw, 1.5vh), 16px)",
                    marginTop: "clamp(24px, min(2.4vw, 3.5vh), 40px)",
                  }}
                >
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{ width: 36, height: 36 }}
                    >
                      <svg viewBox="0 0 30 30" fill="none">
                        <rect width="30" height="30" rx="4" fill="#0A66C2" />
                        <path
                          d="M8.5 11.5h2.6v8.5H8.5v-8.5Zm1.3-3.7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 11.5h2.5v1.2h.05c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4v4.66h-2.6v-4.13c0-.99-.02-2.26-1.38-2.26-1.38 0-1.59 1.08-1.59 2.19v4.2H13v-8.5Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  )}
                  {emailHref && (
                    <a
                      href={emailHref}
                      aria-label={`Email ${member.name}`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{ width: 36, height: 36 }}
                    >
                      <svg viewBox="0 0 30 30" fill="none">
                        <rect width="30" height="30" rx="4" fill="#EA4335" />
                        <path
                          d="M7 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l-8 5.5L7 10Zm0-1h16l-8 5.5L7 9Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  )}
                  {member.twitterUrl && (
                    <a
                      href={member.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on X`}
                      className="inline-block transition-transform duration-200 hover:scale-110"
                      style={{ width: 36, height: 36 }}
                    >
                      <svg viewBox="0 0 30 30" fill="none">
                        <rect width="30" height="30" rx="4" fill="#000" />
                        <path
                          d="M18.6 8h2.3l-5 5.74L22 23h-4.6l-3.62-4.74L9.62 23H7.3l5.35-6.12L7 8h4.72l3.27 4.32L18.6 8Zm-.8 13.6h1.27L11.3 9.34H9.94L17.8 21.6Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
