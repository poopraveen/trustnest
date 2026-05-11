import { brand } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

interface PropertyJsonLdProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    city: string;
    state: string;
    locality: string;
    address: string;
    pincode: string;
    latitude?: number | null;
    longitude?: number | null;
    bhk: number;
    bathrooms: number;
    area: number;
    areaUnit: string;
    propertyType: string;
    listingType: string;
    images: string[];
    verified: boolean;
    amenities: string[];
    createdAt: Date | string;
    updatedAt: Date | string;
    seller: {
      name: string | null;
      email: string;
      phone?: string | null;
    };
  };
}

export function PropertyJsonLd({ property: p }: PropertyJsonLdProps) {
  const base = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description.slice(0, 500),
    url: `${base}/properties/${p.id}`,
    image: p.images.slice(0, 5),
    datePosted: new Date(p.createdAt).toISOString(),
    dateModified: new Date(p.updatedAt).toISOString(),
    floorSize: {
      "@type": "QuantitativeValue",
      value: p.area,
      unitText: p.areaUnit,
    },
    numberOfRooms: p.bhk,
    numberOfBathroomsTotal: p.bathrooms,
    amenityFeature: p.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${p.address}, ${p.locality}`,
      addressLocality: p.city,
      addressRegion: p.state,
      postalCode: p.pincode,
      addressCountry: "IN",
    },
    ...(p.latitude && p.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: p.latitude,
            longitude: p.longitude,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "INR",
      availability:
        p.listingType === "RENT"
          ? "https://schema.org/InStock"
          : "https://schema.org/ForSale",
    },
    seller: {
      "@type": "Person",
      name: p.seller.name ?? p.seller.email,
      ...(p.seller.phone ? { telephone: p.seller.phone } : {}),
    },
    provider: {
      "@type": "Organization",
      name: brand.name,
      url: base,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const base = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: base,
    logo: `${base}/logo.png`,
    description: brand.metaDescription,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: brand.phone,
      contactType: "customer service",
      availableLanguage: ["English", "Tamil"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.officeAddress,
      addressCountry: "IN",
    },
    sameAs: Object.values(brand.social).filter((v) => v && v !== "#"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const base = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${base}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
