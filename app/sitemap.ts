import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/properties",
  "/tnvettri",
  "/login",
  "/register",
  "/expenditure",
  "/scorecards",
  "/projects",
  "/schemes",
  "/grievances",
  "/tenders",
  "/data-sources",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    for (const p of STATIC_PATHS) {
      entries.push({ url: `${base}${prefix}${p}`, lastModified: new Date() });
    }
  }
  return entries;
}
