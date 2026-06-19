import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("✗ SANITY_API_WRITE_TOKEN missing from environment.");
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g", // Update if your ID is different
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const SHEET_ID = "1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

/* ── HELPERS ── */
function companySlug(name) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function titleCase(s) {
  return s.replace(/[a-zA-Z]+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function remapLogo(raw) {
  if (!raw) return raw;
  const normalised = raw.startsWith("/") ? raw : `/${raw}`;
  const match = normalised.match(/^\/images\/logos\/(.+)\.\w+$/);
  if (match) return `/images/portfolio_grid/${match[1]}.png`;
  return normalised;
}

function parseCSV(csv) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"' && csv[i + 1] === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && csv[i + 1] === '\n') i++;
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

async function uploadImage(imagePath) {
  if (!imagePath) return null;
  const cleanPath = imagePath.replace(/^\//, ""); 
  const absPath = path.join(REPO_ROOT, "public", cleanPath);
  
  if (!fs.existsSync(absPath)) {
    console.warn(`  ⚠️ Image not found locally: ${cleanPath}`);
    return null;
  }

  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(absPath),
  });
  return asset._id;
}

/* ── MAIN ── */
async function main() {
  console.log("→ Fetching Google Sheet CSV...");
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error("Failed to fetch Google Sheet");
  
  const csvText = await res.text();
  const rows = parseCSV(csvText);

  console.log(`✓ Fetched ${rows.length - 1} records. Beginning upload...\n`);

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length === 1 && rows[i][0] === "") continue;
    
    const get = (idx) => (rows[i][idx] || "").trim();
    const brandName = get(0);
    if (!brandName) continue;

    process.stdout.write(`• Processing: ${brandName.padEnd(20)} `);

    try {
      const rawLogo = get(7);
      const rawFounder = get(8);
      const logoAssetId = await uploadImage(remapLogo(rawLogo));
      const founderAssetId = await uploadImage(rawFounder);

      const founders = [];
      for (let f = 0; f < 5; f++) {
        const name = get(13 + (f * 2));
        const linkedin = get(14 + (f * 2));
        if (name) {
          founders.push({
            _key: `founder-${brandName.replace(/[^a-zA-Z0-9]/g, '')}-${f}`,
            name,
            linkedin: linkedin || undefined
          });
        }
      }

      const doc = {
        _type: "company",
        brandName,
        slug: { _type: "slug", current: companySlug(brandName) },
        year: get(1),
        sector: get(2),
        status: get(3),
        tags: get(4),
        investmentStage: titleCase(get(5)),
        fundType: get(6),
        foundingYear: get(9),
        oneLiner: get(10),
        about: get(11),
        website: get(12),
      };

      if (founders.length > 0) doc.founders = founders;
      if (logoAssetId) doc.logo = { _type: "image", asset: { _type: "reference", _ref: logoAssetId } };
      if (founderAssetId) doc.founderImage = { _type: "image", asset: { _type: "reference", _ref: founderAssetId } };

      await client.create(doc);
      console.log(`✓ done`);
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
    }
  }

  console.log("\n🎉 All portfolio companies imported successfully!");
}

main().catch((err) => {
  console.error("✗ Import failed:", err);
  process.exit(1);
});