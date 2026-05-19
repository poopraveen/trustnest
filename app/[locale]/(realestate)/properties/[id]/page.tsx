import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import {
  ArrowLeft, BedDouble, Bath, Square, MapPin, CheckCircle,
  Car, Compass, Building2, Calendar, Eye, Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deserializeProperty } from "@/lib/db";
import PropertyGallery from "@/components/PropertyGallery";
import LeadForm from "@/components/LeadForm";
import { PropertyJsonLd } from "@/components/JsonLd";
import {
  formatPrice,
  getPropertyTypeLabel,
  getFurnishingLabel,
  timeAgo,
} from "@/lib/utils";
import type { Property } from "@/types";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-slate-200 h-72 bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading map…
    </div>
  ),
});

async function fetchProperty(id: string, incrementViews: boolean): Promise<Property | null> {
  try {
    const row = await prisma.property.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
            bio: true,
          },
        },
      },
    });

    if (!row || row.status !== "APPROVED" || (row as any).disabled) {
      return null;
    }

    if (incrementViews) {
      await prisma.property.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return deserializeProperty(row) as Property;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const property = await fetchProperty(params.id, false);
  if (!property) {
    return { title: "Property Not Found" };
  }

  const location = [property.locality, property.city].filter(Boolean).join(", ");
  const title = `${property.title} | ${location}`;
  const description = property.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.images[0] ? [{ url: property.images[0] }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const property = await fetchProperty(params.id, true);
  if (!property) {
    notFound();
  }

  const addressLine = [property.address, property.locality, property.city, property.state, property.pincode]
    .filter(Boolean)
    .join(", ");

  const hasMap = property.latitude != null && property.longitude != null;

  return (
    <>
      <PropertyJsonLd property={property} />

      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>

          <PropertyGallery images={property.images} title={property.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          property.listingType === "BUY"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {property.listingType === "BUY" ? "For Sale" : "For Rent"}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {getPropertyTypeLabel(property.propertyType)}
                      </span>
                      {property.verified && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                      {property.title}
                    </h1>
                    <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {addressLine}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-bold text-primary-800">
                      {formatPrice(property.price)}
                      {property.listingType === "RENT" && (
                        <span className="text-base font-normal text-slate-500">/mo</span>
                      )}
                    </p>
                    {property.priceNegotiable && (
                      <p className="text-xs text-slate-500 mt-0.5">Price negotiable</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-4">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-slate-400" />
                    {property.bhk} BHK
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-slate-400" />
                    {property.bathrooms} Bath
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-slate-400" />
                    {property.area} {property.areaUnit}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {property.views + 1} views
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Listed {timeAgo(property.createdAt)}
                  </span>
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-bold text-slate-800 mb-3">Description</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <div className="card p-5">
                <h2 className="font-bold text-slate-800 mb-4">Property details</h2>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <DetailItem icon={Building2} label="Type" value={getPropertyTypeLabel(property.propertyType)} />
                  <DetailItem icon={Tag} label="Furnishing" value={getFurnishingLabel(property.furnishing)} />
                  <DetailItem icon={Car} label="Parking" value={property.parking ? "Yes" : "No"} />
                  {property.floor != null && (
                    <DetailItem
                      icon={Building2}
                      label="Floor"
                      value={`${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`}
                    />
                  )}
                  {property.facing && (
                    <DetailItem icon={Compass} label="Facing" value={property.facing} />
                  )}
                  {property.ageOfProperty != null && (
                    <DetailItem icon={Calendar} label="Age" value={`${property.ageOfProperty} years`} />
                  )}
                </dl>
              </div>

              {property.amenities.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-bold text-slate-800 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasMap && (
                <div>
                  <h2 className="font-bold text-slate-800 mb-3">Location</h2>
                  <PropertyMap
                    latitude={property.latitude!}
                    longitude={property.longitude!}
                    title={property.title}
                    address={addressLine}
                  />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <LeadForm
                propertyId={property.id}
                propertyTitle={property.title}
                sellerPhone={property.seller.phone}
              />

              <div className="card p-5">
                <h3 className="font-bold text-slate-800 mb-3">Listed by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {property.seller.avatar ? (
                      <Image
                        src={property.seller.avatar}
                        alt={property.seller.name ?? "Seller"}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary-700">
                        {property.seller.name?.charAt(0) ?? property.seller.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      {property.seller.name ?? "Property Seller"}
                      {property.seller.isVerified && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </p>
                    {property.seller.email && (
                      <p className="text-xs text-slate-500 truncate">{property.seller.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-slate-400 text-xs mb-0.5 flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
