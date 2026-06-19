import { defineField, defineType } from "sanity";

/**
 * Global Footer — singleton appearing on every page.
 *
 * Only editorial text strings are CMS-controlled. The footer's structure
 * (nav routes, social URLs, layout, watermark, newsletter form behaviour)
 * stays in code because changing those is engineering work, not editing.
 */
export const footer = defineType({
  name: "footer",
  title: "Global — Footer",
  type: "document",

  fields: [
    defineField({
      name: "address",
      title: "Address",
      description: 'e.g. "M3M Urbana, Sector 67, Gurugram, India"',
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Contact email",
      description: 'e.g. "info@titancapital.vc" (shown under the logo)',
      type: "string",
    }),
    defineField({
      name: "copyright",
      title: "Copyright text",
      description: 'e.g. "© 2026 Titan Capital. All rights reserved."',
      type: "string",
    }),
    defineField({
      name: "privacyPolicyLabel",
      title: "Privacy Policy link label",
      description: 'e.g. "Privacy Policy"',
      type: "string",
    }),
    defineField({
      name: "grievanceLabel",
      title: "Grievance Redressal link label",
      description: 'e.g. "Grievance Redressal"',
      type: "string",
    }),
    defineField({
      name: "newsletterTitle",
      title: "Newsletter form title",
      description:
        'Shown above the email input in the cream subscribe card. ' +
        'e.g. "Stay close to what founders are building and where markets are moving - with Titan Capital."',
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "newsletterPlaceholder",
      title: "Newsletter email placeholder",
      description: 'e.g. "Email Id"',
      type: "string",
    }),
    defineField({
      name: "newsletterButtonLabel",
      title: "Newsletter button label",
      description: 'e.g. "Subscribe to Newsletter"',
      type: "string",
    }),
  ],

  preview: { prepare: () => ({ title: "Global — Footer" }) },
});
