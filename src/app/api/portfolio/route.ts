/*
  API Route: /api/portfolio
  Fetches portfolio grid companies from the "portfolioGrid" singleton in Sanity.
*/

import { sanityFetch } from "@/sanity/lib/client";
import { portfolioGridQuery } from "@/sanity/lib/queries";

interface SanityGridCompany {
  brandName: string;
  year: string | null;
  sector: string | null;
  status: string | null;
  tags: string | null;
  investmentStage: string | null;
  fundType: string | null;
  logo: string | null;
  founderImage: string | null;
  foundingYear: string | null;
  oneLiner: string | null;
  about: string | null;
  website: string | null;
  founders: { name: string; linkedin: string | null }[] | null;
}

export interface PortfolioCompany {
  brandName: string;
  year: string;
  sector: string;
  status: string;
  tags: string;
  investmentStage: string;
  fundType: string;
  logo: string;
  founderImage: string;
  isRecent: boolean;
}

function getRecentYears(companies: SanityGridCompany[]): Set<string> {
  const years = companies
    .map((c) => c.year || "")
    .filter(Boolean)
    .sort()
    .reverse();
  const uniqueYears = [...new Set(years)];
  return new Set(uniqueYears.slice(0, 2));
}

function distinctValues(companies: SanityGridCompany[], key: keyof SanityGridCompany): string[] {
  const set = new Set<string>();
  for (const c of companies) {
    const val = c[key];
    if (typeof val === "string" && val.trim()) set.add(val.trim());
  }
  return Array.from(set).sort();
}

export async function GET() {
  try {
    const result = await sanityFetch<{ companies: SanityGridCompany[] } | null>({
      query: portfolioGridQuery,
      revalidate: 60,
    });

    const companies = result?.companies || [];

    if (companies.length === 0) {
      return Response.json({
        companies: [],
        filters: { sector: [], year: [], status: [], tags: [], investmentStage: [], fundType: [] },
      });
    }

    const recentYears = getRecentYears(companies);

    const enriched: PortfolioCompany[] = companies.map((c) => ({
      brandName: c.brandName || "",
      year: c.year || "",
      sector: c.sector || "",
      status: c.status || "",
      tags: c.tags || "",
      investmentStage: c.investmentStage || "",
      fundType: c.fundType || "",
      logo: c.logo || "",
      founderImage: c.founderImage || "",
      isRecent: recentYears.has(c.year || ""),
    }));

    const filters = {
      sector: distinctValues(companies, "sector"),
      year: distinctValues(companies, "year"),
      status: distinctValues(companies, "status"),
      tags: distinctValues(companies, "tags"),
      investmentStage: distinctValues(companies, "investmentStage"),
      fundType: distinctValues(companies, "fundType"),
    };

    return Response.json({ companies: enriched, filters });
  } catch (err) {
    console.error("Portfolio API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
