"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
   Types — shared with the server wrapper (OurTeam.tsx).
   ───────────────────────────────────────────────────────── */
export interface TeamMember {
  name: string;
  /** URL slug — also drives /ourteam/<slug> detail page. */
  slug?: string;
  title: string;
  bio?: string;
  image?: string;
  linkedinUrl?: string;
  emailUrl?: string;
  twitterUrl?: string;
}

export interface OurTeamData {
  headingFirst?: string;
  headingSecond?: string;
  corporateTeam?: TeamMember[];
  seedTeam?: TeamMember[];
  winnerFundTeam?: TeamMember[];
}

/* Slug helper for fallback data + safety net when a Sanity entry
   forgets its slug. Lowercase, alphanumeric joined by hyphens. */
export function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─────────────────────────────────────────────────────────
   Fallback content — rendered when Sanity returns null or
   the doc hasn't been populated yet. Editors replace by
   creating the "Our Team Page" document in Studio.
   Placeholder URLs (#) ensure all three social icons render
   so the layout matches the design even before real links
   are added in Studio.
   ───────────────────────────────────────────────────────── */
const FALLBACK_HEADING_FIRST = "Meet The";
const FALLBACK_HEADING_SECOND = "Full Team.";

function fallback(name: string, title: string): TeamMember {
  return {
    name,
    slug: teamSlug(name),
    title,
    linkedinUrl: "#",
    emailUrl: "info@titancapital.vc",
    twitterUrl: "#",
  };
}

const FALLBACK_CORPORATE: TeamMember[] = [
  fallback("Chetan Rana", "CFO"),
  fallback("Aakriti Kakkar", "Vice President — Corporate Development"),
  fallback("Supriya Gupta", "Community Marketing Lead"),
  fallback("Aditi Jain", "Associate Investment Director"),
  fallback("Manya Awasthi", "Manager — Investment Operations"),
  fallback("Ram Damani", "Manager — Finance and Operations"),
  fallback("Aashray Satija", "Corporate Development"),
];
const FALLBACK_SEED: TeamMember[] = [
  fallback("Manik Pasricha", "Vice President"),
  fallback("Utpal Sharma", "Vice President"),
  fallback("Preetit Singhi", "Associate"),
  fallback("Chiragh Cariappa", "Investment Analyst"),
  fallback("Aditya Jaikumar", "Investment Analyst"),
  fallback("Geetansh Popli", "Investment Analyst"),
];
const FALLBACK_WINNER: TeamMember[] = [
  fallback("Shiv Kapoor", "Vice President"),
  fallback("Vrinda Gupta", "Investment Analyst"),
  fallback("Vatsal Singh", "Investment Analyst"),
];

/* ─────────────────────────────────────────────────────────
   Sanity CDN transform helper.
   ───────────────────────────────────────────────────────── */
function cdnImageSrc(url: string, width: number): string {
  if (!url) return url;
  if (!url.startsWith("https://cdn.sanity.io/")) return url;
  return `${url}?w=${width}&auto=format&q=85`;
}

/* ─────────────────────────────────────────────────────────
   Reusable organic blob path — used as both the background
   decoration AND the clip-path for the photo. Two SVG defs
   live at the top of the section; cards reference them by id.
   The viewBox is 254×250 so transforms can use clipPathUnits
   ="objectBoundingBox" by scaling 1/254 × 1/250.
   ───────────────────────────────────────────────────────── */
/* Three blob variants — used in rotation so cards don't all look
   identical. Each is a 254×250 viewBox organic shape resembling
   the asymmetric blue blob in the design ref. */
const BLOB_PATHS = [
  // wider top-right, narrower bottom-left
  "M198 18 C234 32 252 88 244 142 C236 196 198 234 144 240 C90 246 38 230 16 188 C-6 144 6 92 32 58 C58 24 102 6 148 8 C170 9 184 12 198 18 Z",
  // bulkier left, slim right
  "M186 14 C224 22 250 60 250 118 C250 176 226 220 174 236 C122 252 64 240 30 204 C-4 168 0 110 20 70 C42 28 90 6 136 8 C158 9 172 10 186 14 Z",
  // wave-edged organic
  "M204 24 C232 44 250 96 240 150 C232 200 200 232 152 240 C100 248 50 232 22 196 C-4 162 2 108 22 70 C46 30 96 8 144 10 C170 12 188 14 204 24 Z",
];

function BlobDefs() {
  // Renders an invisible SVG with one clip-path per blob variant.
  // TeamCard references the matching id based on its rotation slot.
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        {BLOB_PATHS.map((d, i) => (
          <clipPath
            key={i}
            id={`our-team-blob-clip-${i}`}
            clipPathUnits="objectBoundingBox"
          >
            <path d={d} transform={`scale(${1 / 254} ${1 / 250})`} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Social icon SVGs — inlined so we don't ship an icon
   library for three icons. 30×30 per spec.
   ───────────────────────────────────────────────────────── */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" className="h-full w-full">
      <rect width="30" height="30" rx="4" fill="#0A66C2" />
      <path
        d="M8.5 11.5h2.6v8.5H8.5v-8.5Zm1.3-3.7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 11.5h2.5v1.2h.05c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4v4.66h-2.6v-4.13c0-.99-.02-2.26-1.38-2.26-1.38 0-1.59 1.08-1.59 2.19v4.2H13v-8.5Z"
        fill="white"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" className="h-full w-full">
      <rect width="30" height="30" rx="4" fill="#EA4335" />
      <path
        d="M7 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l-8 5.5L7 10Zm0-1h16l-8 5.5L7 9Z"
        fill="white"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" className="h-full w-full">
      <rect width="30" height="30" rx="4" fill="#000" />
      <path
        d="M18.6 8h2.3l-5 5.74L22 23h-4.6l-3.62-4.74L9.62 23H7.3l5.35-6.12L7 8h4.72l3.27 4.32L18.6 8Zm-.8 13.6h1.27L11.3 9.34H9.94L17.8 21.6Z"
        fill="white"
      />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-block transition-transform duration-200 hover:scale-110"
      style={{
        width: "clamp(22px, min(2vw, 3vh), 30px)",
        height: "clamp(22px, min(2vw, 3vh), 30px)",
        aspectRatio: "1 / 1",
      }}
    >
      {children}
    </a>
  );
}

/* ─────────────────────────────────────────────────────────
   Single team-member card — blob background + clipped photo
   (monochrome by default, colour on hover) + name + title
   + social icons.
   ───────────────────────────────────────────────────────── */
function TeamCard({
  member,
  variantIndex,
  rotateBlob,
}: {
  member: TeamMember;
  /** Index into BLOB_PATHS so cards cycle through blob shapes. */
  variantIndex: number;
  /** Small rotation applied to the bg blob for extra organic variety. */
  rotateBlob: number;
}) {
  const slug = member.slug || teamSlug(member.name);
  const blobIdx = variantIndex % BLOB_PATHS.length;

  // Normalise the email link — accept either a plain address or a
  // pre-formed mailto:.
  const emailHref =
    member.emailUrl &&
    (member.emailUrl.startsWith("mailto:")
      ? member.emailUrl
      : `mailto:${member.emailUrl}`);

  return (
    <motion.div
      className="group flex flex-col items-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {/* ── PHOTO + BLOB — wrapped in a Link to /ourteam/<slug>.
            Hover scales the whole card subtly and reveals the
            colour photo (monochrome → colour). ── */}
      <Link
        href={`/ourteam/${slug}`}
        aria-label={`${member.name} — ${member.title}`}
        className="block focus:outline-none"
      >
        <div
          className="relative transition-transform duration-300 ease-out group-hover:-translate-y-1"
          style={{
            width: "clamp(180px, min(17.6vw, 25.8vh), 254px)",
            aspectRatio: "254 / 250",
          }}
        >
          {/* ── BG BLOB — solid light-blue, offset/rotated for halo ── */}
          <svg
            viewBox="0 0 254 250"
            fill="none"
            aria-hidden
            className="absolute h-full w-full"
            style={{
              top: "6%",
              left: "5%",
              transform: `rotate(${rotateBlob}deg)`,
              transformOrigin: "center",
            }}
          >
            <path d={BLOB_PATHS[blobIdx]} fill="#D3E2FF" />
          </svg>

          {/* ── PHOTO — clipped to the same blob shape; monochrome
                  by default with smooth colour return on hover. ── */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `url(#our-team-blob-clip-${blobIdx})` }}
          >
            {member.image ? (
              <Image
                src={cdnImageSrc(member.image, 600)}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 254px"
                className="object-cover transition-[filter] duration-500 ease-out [filter:grayscale(1)] group-hover:[filter:grayscale(0)]"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-[#E5E5E5] font-['Poppins',_sans-serif] text-[#9A9A9A]"
                style={{ fontSize: "clamp(28px, 4vw, 56px)" }}
              >
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ── NAME ── */}
        <h3
          className="m-0 text-center font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
          style={{
            fontSize: "clamp(18px, min(2.5vw, 3.67vh), 36px)",
            lineHeight: "158%",
            marginTop: "clamp(12px, min(1.4vw, 2vh), 24px)",
            maxWidth: "359px",
          }}
        >
          {member.name}
        </h3>

        {/* ── TITLE ── */}
        <p
          className="m-0 text-center font-['Poppins',_sans-serif] font-normal text-[#0E0E0E]"
          style={{
            fontSize: "clamp(13px, min(1.67vw, 2.44vh), 24px)",
            lineHeight: "158%",
            marginTop: "clamp(2px, 0.4vw, 8px)",
            maxWidth: "421px",
          }}
        >
          {member.title}
        </p>
      </Link>

      {/* ── SOCIAL ICONS — outside the Link so each icon is its
            own focusable, navigable anchor. ── */}
      {(member.linkedinUrl || emailHref || member.twitterUrl) && (
        <div
          className="flex items-center justify-center"
          style={{
            gap: "clamp(8px, min(0.83vw, 1.22vh), 14px)",
            marginTop: "clamp(10px, min(1.1vw, 1.6vh), 16px)",
          }}
        >
          {member.linkedinUrl && (
            <SocialLink
              href={member.linkedinUrl}
              label={`${member.name} on LinkedIn`}
            >
              <LinkedInIcon />
            </SocialLink>
          )}
          {emailHref && (
            <SocialLink href={emailHref} label={`Email ${member.name}`}>
              <MailIcon />
            </SocialLink>
          )}
          {member.twitterUrl && (
            <SocialLink
              href={member.twitterUrl}
              label={`${member.name} on X`}
            >
              <XIcon />
            </SocialLink>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   Team group — sub-section heading + responsive grid of
   cards. 3 cols desktop, 2 cols tablet, 1 col mobile.
   ───────────────────────────────────────────────────────── */
const BLOB_ROTATIONS = [-6, 4, -2, 8, -10, 5, -4];

function TeamGroup({
  title,
  members,
}: {
  title: string;
  members: TeamMember[];
}) {
  if (members.length === 0) return null;
  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ gap: "clamp(28px, min(3.33vw, 4.89vh), 56px)" }}
    >
      <motion.h2
        className="m-0 text-center font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D] max-md:!text-[24px]"
        style={{
          fontSize: "clamp(24px, min(3.06vw, 4.48vh), 44px)",
          lineHeight: "120%",
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {title}
      </motion.h2>

      {/* flex-wrap (not grid) so incomplete trailing rows auto-center
            instead of clinging to the leftmost grid column. Each card
            gets a fixed flex-basis so 3 fit per row on desktop, 2 on
            tablet, 1 on mobile — without any breakpoint switching. */}
      <div
        className="flex w-full max-w-[1100px] flex-wrap justify-center"
        style={{
          rowGap: "clamp(36px, min(4vw, 6vh), 72px)",
          columnGap: "clamp(20px, min(2vw, 3vh), 40px)",
        }}
      >
        {members.map((member, i) => (
          <div
            key={`${title}-${i}-${member.name}`}
            className="flex shrink-0 justify-center"
            style={{ flexBasis: "clamp(220px, 28%, 320px)" }}
          >
            <TeamCard
              member={member}
              variantIndex={i}
              rotateBlob={BLOB_ROTATIONS[i % BLOB_ROTATIONS.length]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component.
   ───────────────────────────────────────────────────────── */
export default function OurTeamClient({
  data,
}: {
  data?: OurTeamData | null;
}) {
  const headingFirst = data?.headingFirst || FALLBACK_HEADING_FIRST;
  const headingSecond = data?.headingSecond || FALLBACK_HEADING_SECOND;
  const corporate =
    data?.corporateTeam && data.corporateTeam.length > 0
      ? data.corporateTeam
      : FALLBACK_CORPORATE;
  const seed =
    data?.seedTeam && data.seedTeam.length > 0
      ? data.seedTeam
      : FALLBACK_SEED;
  const winner =
    data?.winnerFundTeam && data.winnerFundTeam.length > 0
      ? data.winnerFundTeam
      : FALLBACK_WINNER;

  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-white"
      style={{
        marginTop: "var(--nav-height)",
        paddingTop: "clamp(40px, min(5vw, 7vh), 100px)",
        paddingBottom: "clamp(48px, min(7vw, 10vh), 120px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      {/* SVG defs for the blob clip-path (must live somewhere in
          the DOM for url(#…) references in this section to work). */}
      <BlobDefs />

      <div className="mx-auto flex w-full max-w-[1330px] flex-col items-center">
        {/* ── PAGE HEADING — italic phrase first on a light-blue
              pill, regular phrase after. Same scaleX + variants
              pattern WinnersHero uses. ── */}
        <motion.div
          className="flex flex-row flex-wrap items-baseline justify-center text-center"
          style={{
            gap: "clamp(8px, min(1vw, 1.5vh), 18px)",
            marginBottom: "clamp(48px, min(6vw, 9vh), 120px)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div
            className="relative inline-flex items-center justify-center overflow-hidden bg-transparent px-[10px] py-[6px] md:px-[14px] md:py-[10px]"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 z-0 h-full w-full bg-[#D3E2FF]"
              style={{ transformOrigin: "left", borderRadius: "4px" }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
                },
              }}
            />
            <span
              className="relative z-10 font-['Libre_Baskerville',_serif] font-semibold italic leading-[120%] text-[#001A4D] max-md:!text-[32px]"
              style={{ fontSize: "var(--heading-xl)" }}
            >
              {headingFirst}
            </span>
          </motion.div>

          <motion.h1
            className="m-0 font-['Libre_Baskerville',_serif] font-semibold leading-[120%] text-[#001A4D] max-md:!text-[32px]"
            style={{ fontSize: "var(--heading-xl)" }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
              },
            }}
          >
            {headingSecond}
          </motion.h1>
        </motion.div>

        {/* ── THREE TEAM GROUPS ── */}
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: "clamp(60px, min(8vw, 12vh), 140px)" }}
        >
          <TeamGroup title="Corporate Team" members={corporate} />
          <TeamGroup title="Seed Team" members={seed} />
          <TeamGroup title="Winner Fund Team" members={winner} />
        </div>
      </div>
    </section>
  );
}
