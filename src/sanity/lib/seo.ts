import type { Metadata } from "next";
import { sanityFetch } from "./client";
import { pageSeoByKeyQuery, siteSeoQuery } from "./queries";

type SiteSeo = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultShareImage?: string;
  keywords?: string[];
};

type PageSeo = {
  pageKey: string;
  metaTitle?: string;
  metaDescription?: string;
  shareImage?: string;
};

/**
 * Builds a Next.js Metadata object from Sanity.
 *
 *   - With no pageKey: returns the sitewide defaults (use in layout.tsx).
 *   - With a pageKey: merges in the per-page override on top of defaults.
 *
 * Any missing field on the per-page doc falls back to the sitewide value.
 */
export async function buildMetadata(pageKey?: string): Promise<Metadata> {
  const site = await sanityFetch<SiteSeo | null>({
    query: siteSeoQuery,
    tags: ["seo"],
  });

  const page = pageKey
    ? await sanityFetch<PageSeo | null>({
        query: pageSeoByKeyQuery,
        params: { pageKey },
        tags: ["seo", `seo:${pageKey}`],
      })
    : null;

  const siteName = site?.siteName ?? "Titan Capital";
  const siteUrl = site?.siteUrl ?? "https://titan-capital-puce.vercel.app";
  const title = page?.metaTitle ?? site?.defaultTitle ?? siteName;
  const description = page?.metaDescription ?? site?.defaultDescription ?? "";
  const shareImage = page?.shareImage ?? site?.defaultShareImage;

  return {
    title: pageKey
      ? title
      : { default: title, template: `%s - ${siteName}` },
    description,
    keywords: site?.keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    metadataBase: new URL(siteUrl),
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title,
      description,
      url: siteUrl,
      images: shareImage
        ? [{ url: shareImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
    manifest: "/site.webmanifest",
    other: {
      "msapplication-TileImage": "/icon-192.png",
    },
  };
}
