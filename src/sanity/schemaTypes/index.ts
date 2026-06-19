import type { SchemaTypeDefinition } from "sanity";
import { backedBefore } from "./backedBefore";
import { company } from "./company";
import { foundersTestimonial } from "./foundersTestimonial";
import { hero } from "./hero";
import { impactAtGlance } from "./impactAtGlance";
import { indicornSpotlight } from "./indicornSpotlight";
import { titanSeedHero } from "./titanSeedHero";
import { whatFoundersGet } from "./whatFoundersGet";
import { whatWeBelieve } from "./whatWeBelieve";
import { whatWeLookFor } from "./whatWeLookFor";
import { whyTitanSeed } from "./whyTitanSeed";

/**
 * Registry of every document/object type the Studio knows about.
 * Add new schemas here so they show up in the Studio sidebar.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  /* Home page */
  hero,
  impactAtGlance,
  indicornSpotlight,
  foundersTestimonial,
  backedBefore,
  whatWeBelieve,
  whatFoundersGet,
  /* Titan Seed page */
  titanSeedHero,
  whyTitanSeed,
  whatWeLookFor,
  /* Portfolio */
  company,
];
