/**
 * Import Perumalpattu voter extract into data/ward-election/perumalpattu/ward_members.json
 *
 * Usage:
 *   node scripts/import-perumalpattu-voters.mjs
 *   node scripts/import-perumalpattu-voters.mjs "D:\permalattu\voters_perimalpattu.json"
 */
import fs from "fs";
import path from "path";

const DEFAULT_SRC = "D:\\permalattu\\voters_perimalpattu.json";
const OUT = path.join(process.cwd(), "data/ward-election/perumalpattu/ward_members.json");

const src = process.argv[2] || DEFAULT_SRC;

if (!fs.existsSync(src)) {
  console.error(`Source not found: ${src}`);
  process.exit(1);
}

function isJunk(r) {
  const n = String(r.Name || "").trim();
  if (!n || n.length < 2) return true;
  if (/assembly constituency/i.test(n)) return true;
  if (/^\d+\s*-\s*POONAMALLEE/i.test(n)) return true;
  if (/part\s+no\.?\s*:/i.test(n)) return true;
  if (/^name\s+of\s+the\s+electors/i.test(n)) return true;
  if (/^section\s+no/i.test(n)) return true;
  if (/^polling\s+station/i.test(n)) return true;
  return false;
}

function normAge(age) {
  if (age === "" || age == null) return "";
  const n = parseFloat(String(age).replace(/,/g, ""));
  return Number.isNaN(n) ? "" : n;
}

function normGender(g) {
  const s = String(g || "").trim();
  if (!s) return "";
  const l = s.toLowerCase();
  if (l === "male" || l === "m") return "Male";
  if (l === "female" || l === "f") return "Female";
  return s;
}

const raw = JSON.parse(fs.readFileSync(src, "utf8"));
if (!Array.isArray(raw)) {
  console.error("Expected JSON array");
  process.exit(1);
}

const out = [];
let skipped = 0;
const wardCounts = new Map();

for (const r of raw) {
  if (isJunk(r)) {
    skipped++;
    continue;
  }
  const ward = parseInt(String(r.Ward).replace(/\D/g, ""), 10);
  if (!ward || Number.isNaN(ward)) {
    skipped++;
    continue;
  }

  const row = {
    Ward: ward,
    Page: 1,
    Serial_No: String(r.Serial_No ?? "").trim(),
    Voter_ID: String(r.Voter_ID ?? "").trim(),
    Name: String(r.Name ?? "").trim(),
    Relative_Type: String(r.Relative_Type ?? "").trim(),
    Relative_Name: String(r.Relative_Name ?? "").trim(),
    House_Number: String(r.House_Number ?? "").trim(),
    Age: normAge(r.Age),
    Gender: normGender(r.Gender),
  };

  out.push(row);
  wardCounts.set(ward, (wardCounts.get(ward) ?? 0) + 1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log(`Imported ${out.length} voters (skipped ${skipped})`);
console.log(`→ ${OUT}`);
console.log("Parts:", [...wardCounts.entries()].sort((a, b) => a[0] - b[0]).map(([w, c]) => `${w}:${c}`).join(", "));
console.log("\nRun: npm run ward:gen");
