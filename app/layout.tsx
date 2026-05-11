import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { brand, pageTitleWithTagline } from "@/lib/brand";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: pageTitleWithTagline(),
    template: `%s | ${brand.name}`,
  },
  description: brand.metaDescription,
  keywords: [
    "real estate india", "buy property", "rent property", "apartments",
    "villas", "plots", "property listing", "housing", "home buying",
  ],
  authors: [{ name: brand.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: brand.name,
    title: pageTitleWithTagline(),
    description: `Buy, sell, or rent verified properties across India with ${brand.name}.`,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} – Real Estate Platform`,
    description: brand.metaDescription.slice(0, 200),
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/images/tn-govt-emblem.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <OrganizationJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
