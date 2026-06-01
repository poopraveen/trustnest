#!/usr/bin/env node
/**
 * Print tenant branding env for Vercel (stdout). Does not include secrets.
 *
 * Usage:
 *   node scripts/export-vercel-env.mjs vepcitybazar
 *   node scripts/export-vercel-env.mjs vepcitybazar --url https://your-project.vercel.app
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const tenantsDir = path.join(root, "env", "tenants");

const BRANDING_KEYS = [
  "NEXT_PUBLIC_BRAND_NAME",
  "NEXT_PUBLIC_BRAND_WORDMARK_PREFIX",
  "NEXT_PUBLIC_BRAND_WORDMARK_ACCENT",
  "NEXT_PUBLIC_BRAND_TAGLINE",
  "NEXT_PUBLIC_BRAND_FOOTER_DESCRIPTION",
  "NEXT_PUBLIC_BRAND_SUPPORT_EMAIL",
  "NEXT_PUBLIC_BRAND_PHONE",
  "NEXT_PUBLIC_BRAND_OFFICE_ADDRESS",
  "NEXT_PUBLIC_BRAND_DOMAIN",
  "NEXT_PUBLIC_BRAND_META_DESCRIPTION",
  "NEXT_PUBLIC_BRAND_FACEBOOK",
  "NEXT_PUBLIC_BRAND_TWITTER",
  "NEXT_PUBLIC_BRAND_INSTAGRAM",
  "NEXT_PUBLIC_BRAND_LINKEDIN",
  "NEXT_PUBLIC_BRAND_YOUTUBE",
  "NEXT_PUBLIC_BRAND_FOOTER_CITIES",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_APP_URL",
];

function parseEnv(content) {
  const obj = {};
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    obj[key] = val;
  }
  return obj;
}

const tenantId = process.argv[2];
const urlFlag = process.argv.indexOf("--url");
const overrideUrl =
  urlFlag !== -1 ? process.argv[urlFlag + 1]?.replace(/\/+$/, "") : null;

if (!tenantId) {
  console.error("Usage: node scripts/export-vercel-env.mjs <tenant> [--url https://...]");
  console.error("Tenants:", fs.readdirSync(tenantsDir).filter((f) => f.endsWith(".env")).map((f) => f.replace(".env", "")).join(", "));
  process.exit(1);
}

const tenantFile = path.join(tenantsDir, `${tenantId}.env`);
if (!fs.existsSync(tenantFile)) {
  console.error(`Missing ${tenantFile}`);
  process.exit(1);
}

const tenant = parseEnv(fs.readFileSync(tenantFile, "utf8"));
if (overrideUrl) {
  tenant.NEXTAUTH_URL = overrideUrl;
  tenant.NEXT_PUBLIC_APP_URL = overrideUrl;
}

const lines = [];
for (const key of BRANDING_KEYS) {
  if (!(key in tenant)) continue;
  const val = tenant[key] ?? "";
  lines.push(`${key}=${val}`);
}

const outFile = path.join(tenantsDir, `${tenantId}.vercel.txt`);
const body = [
  "# Vercel bulk paste (Settings → Environment Variables → paste in Key input)",
  "# If import says 'No environment variables were created' → keys ALREADY EXIST.",
  "#   Edit each key manually, OR delete old keys first, then paste again.",
  "# After changes: Deployments → Redeploy (required for NEXT_PUBLIC_*).",
  "",
  ...lines,
  "",
].join("\n");

fs.writeFileSync(outFile, body, "utf8");
process.stdout.write(body);
console.error(`\n→ Wrote ${outFile}`);
