import { defineField, defineType } from "sanity";

/**
 * Sitewide SEO defaults. Singleton.
 *
 * Editors set this ONCE; every page inherits from it. Per-page overrides
 * live in the separate `pageSeo` schema. Layout-level fields here (site
 * name, base URL, default share image) are the same on every page.
 */
export const siteSeo = defineType({
  name: "siteSeo",
  title: "SEO — Sitewide Defaults",
  type: "document",

  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      description: 'Shown in browser tabs after the page title, e.g. "About Us – Titan Capital"',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "siteUrl",
      title: "Live site URL",
      description: 'Production URL, no trailing slash. e.g. "https://titancapital.vc"',
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "defaultTitle",
      title: "Default browser tab title",
      description: "Used on any page without its own override (e.g. the home page).",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "defaultDescription",
      title: "Default page description",
      description: "The snippet shown under your link in Google results. ~150 characters works best.",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "defaultShareImage",
      title: "Default share image (OG image)",
      description:
        "Shown when someone shares any page on WhatsApp / LinkedIn / Twitter. Use 1200×630 pixels.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      description: "Comma-separated terms for old-school search engines. Optional.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],

  preview: { prepare: () => ({ title: "SEO — Sitewide Defaults" }) },
});
