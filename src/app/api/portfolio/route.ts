/*
  API Route: /api/portfolio
  Fetches the public Google Sheet as CSV, parses it, and returns structured JSON.
  Caches for 5 minutes via Next.js revalidation to avoid hammering the sheet.

  Sheet: https://docs.google.com/spreadsheets/d/1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4
  Columns: Brand Name | Year | (Sector) | Status | Invested In | Founding Year |
           One Liner | About the company | Website | Founder1 Name | Linkedin | ... | Logo

  NOTE: The sheet's first row merges headers + Snapdeal's data (e.g. "Brand Name Snapdeal").
  We strip known header prefixes from row 0 to recover that company.
*/

const SHEET_ID = "1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export interface PortfolioCompany {
  brandName: string;
  year: string;
  sector: string;
  status: string;
  investedIn: string;
  foundingYear: string;
  logo: string;
}

/* Known header labels by column index — used to split the merged header+data row 0. */
const HEADER_PREFIXES: Record<number, string> = {
  0: "Brand Name",
  1: "Year",
  2: "Sector",
  3: "Status",
  4: "Invested In",
  5: "Founding Year",
  6: "Logo",
};

/** Simple CSV parser that handles quoted fields. */
function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/** Strip the known header prefix from a cell (row 0 only). */
function stripHeader(colIdx: number, raw: string): string {
  const prefix = HEADER_PREFIXES[colIdx];
  if (!prefix) return raw; // no header to strip (e.g. Sector column)
  if (raw.startsWith(prefix)) {
    return raw.slice(prefix.length).trim();
  }
  return raw;
}

function rowToCompany(fields: string[], isHeaderRow: boolean): PortfolioCompany | null {
  const get = (idx: number) => {
    const raw = fields[idx] || "";
    return isHeaderRow ? stripHeader(idx, raw) : raw;
  };

  const brandName = get(0);
  if (!brandName) return null;

  const founders: { name: string; linkedin: string }[] = [];
  for (let f = 0; f < 5; f++) {
    const name = get(9 + f * 2);
    const linkedin = get(10 + f * 2);
    if (name) founders.push({ name, linkedin });
  }

  return {
    brandName,
    year: get(1),
    sector: get(2),
    status: get(3),
    investedIn: get(4),
    foundingYear: get(5),
    logo: get(6),

  };
}

function parseCSV(csv: string): PortfolioCompany[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const companies: PortfolioCompany[] = [];

  for (let i = 0; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);
    const company = rowToCompany(fields, i === 0);
    if (company) companies.push(company);
  }

  return companies;
}

/** Extract unique non-empty values for a given key. */
function distinctValues(
  companies: PortfolioCompany[],
  key: keyof PortfolioCompany
): string[] {
  const set = new Set<string>();
  for (const c of companies) {
    const val = c[key];
    if (typeof val === "string" && val.trim()) set.add(val.trim());
  }
  return Array.from(set).sort();
}

/** Determine "recently invested" companies (last 2 financial years). */
function getRecentYears(companies: PortfolioCompany[]): Set<string> {
  const years = companies
    .map((c) => c.year)
    .filter(Boolean)
    .sort()
    .reverse();

  const uniqueYears = [...new Set(years)];
  return new Set(uniqueYears.slice(0, 2)); // top-2 most recent year bands
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 300 } });
    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch Google Sheet" },
        { status: 502 }
      );
    }

    const csvText = await res.text();
    const companies = parseCSV(csvText);
    const recentYears = getRecentYears(companies);

    // Tag each company with isRecent
    const enriched = companies.map((c) => ({
      ...c,
      isRecent: recentYears.has(c.year),
    }));

    const filters = {
      sector: distinctValues(companies, "sector"),
      year: distinctValues(companies, "year"),
      status: distinctValues(companies, "status"),
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
