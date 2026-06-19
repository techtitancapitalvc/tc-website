import { defineField, defineType } from "sanity";

/**
 * Get Investment page — Form section.
 *
 * Singleton. Manages the section headings, descriptions, and
 * configurable labels. Form logic / validation stays in code.
 */
export const getInvestmentForm = defineType({
  name: "getInvestmentForm",
  title: "Get Investment — Form Section",
  type: "document",

  fields: [
    defineField({
      name: "section1Label",
      title: "Section 1 — Top label",
      description: 'e.g. "About You"',
      type: "string",
    }),
    defineField({
      name: "section1Title",
      title: "Section 1 — Title",
      description: 'e.g. "The Founder"',
      type: "string",
    }),
    defineField({
      name: "section1Subtitle",
      title: "Section 1 — Subtitle",
      description: 'e.g. "We invest in people first. Tell us who you are."',
      type: "string",
    }),
    defineField({
      name: "section2Label",
      title: "Section 2 — Top label",
      description: 'e.g. "The Company"',
      type: "string",
    }),
    defineField({
      name: "section2Title",
      title: "Section 2 — Title",
      description: 'e.g. "What Are You Building?"',
      type: "string",
    }),
    defineField({
      name: "section2Subtitle",
      title: "Section 2 — Subtitle",
      type: "string",
    }),
    defineField({
      name: "submitButtonLabel",
      title: "Submit button label",
      description: 'e.g. "Submit Application"',
      type: "string",
    }),
    defineField({
      name: "successTitle",
      title: "Success screen — Title",
      description: 'e.g. "Application submitted"',
      type: "string",
    }),
    defineField({
      name: "successMessage",
      title: "Success screen — Message",
      description: 'e.g. "We read every application. You\'ll hear from us soon."',
      type: "string",
    }),
  ],

  preview: { prepare: () => ({ title: "Get Investment — Form Section" }) },
});
