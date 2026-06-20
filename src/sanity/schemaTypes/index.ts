import type { SchemaTypeDefinition } from "sanity";
import { aboutTheFund } from "./aboutTheFund";
import { backedBefore } from "./backedBefore";
import { company } from "./company";
import { footer } from "./footer";
import { foundersTestimonial } from "./foundersTestimonial";
import { fundDetails } from "./fundDetails";
import { hero } from "./hero";
import { navbar } from "./navbar";
import { impactAtGlance } from "./impactAtGlance";
import { indicornSpotlight } from "./indicornSpotlight";
import { portfolioWinnerFund } from "./portfolioWinnerFund";
import { titanSeedHero } from "./titanSeedHero";
import { whatFoundersGet } from "./whatFoundersGet";
import { whatWeBelieve } from "./whatWeBelieve";
import { whatWeLookFor } from "./whatWeLookFor";
import { whyTitanSeed } from "./whyTitanSeed";
import { getInvestmentFAQ } from "./getInvestmentFAQ";
import { getInvestmentForm } from "./getInvestmentForm";
import { getInvestmentHero } from "./getInvestmentHero";
import { portfolioGrid } from "./portfolioGrid";
import { winnersHero } from "./winnersHero";

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
  /* Winners Fund page */
  winnersHero,
  aboutTheFund,
  portfolioWinnerFund,
  fundDetails,
  /* Get Investment page */
  getInvestmentHero,
  getInvestmentForm,
  getInvestmentFAQ,
  /* Global */
  navbar,
  footer,
  /* Portfolio */
  company,
  portfolioGrid,
];
