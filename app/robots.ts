import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const BASE = getSiteUrl();
const ROBOTS_HOST = new URL(BASE).host;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/properties", "/properties/"],
        disallow: [
          "/admin",
          "/seller/",
          "/api/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: ROBOTS_HOST,
  };
}
