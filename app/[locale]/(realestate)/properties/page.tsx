export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import { prisma } from "@/lib/prisma";
import { deserializeProperty } from "@/lib/db";
import {
  List, Search, LayoutGrid,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import SortDropdown from "./SortDropdown";
import { Link } from "@/navigation";
import { formatPrice } from "@/lib/utils";
import type { PropertyFilters as Filters } from "@/types";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const city = searchParams.city;
  const type = searchParams.listingType;
  const propType = Array.isArray(searchParams.propertyType) ? searchParams.propertyType[0] : searchParams.propertyType;

  const typeLabel = type === "BUY" ? "for Sale" : type === "RENT" ? "for Rent" : "for Sale & Rent";
  const cityLabel = city ? ` in ${city}` : " across India";
  const propLabel = propType ? ` ${propType.replace("_", " ").toLowerCase()}` : " property";

  const title = city
    ? `Buy & Rent Properties in ${city} | PooPrav TrustNest`
    : `Properties for Sale & Rent in India | PooPrav TrustNest`;

  const description = `Browse verified${propLabel} listings ${typeLabel}${cityLabel}. Apartments, villas, plots & more. Trusted by thousands of buyers and renters.`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/properties${city ? `?city=${city}` : ""}` },
  };
}

interface PageProps {
  searchParams: {
    city?: string;
    listingType?: string;
    propertyType?: string | string[];
    bhk?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    furnishing?: string | string[];
    verified?: string;
    search?: string;
    sortBy?: string;
    page?: string;
    view?: string;
  };
}

async function getProperties(params: PageProps["searchParams"]) {
  const page = Number(params.page ?? 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = { status: "APPROVED" };

  if (params.city) where.city = { contains: params.city, mode: "insensitive" };
  if (params.listingType) where.listingType = params.listingType;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { locality: { contains: params.search, mode: "insensitive" } },
      { city: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const types = Array.isArray(params.propertyType)
    ? params.propertyType
    : params.propertyType
    ? [params.propertyType]
    : [];
  if (types.length > 0) where.propertyType = { in: types };

  const bhks = Array.isArray(params.bhk)
    ? params.bhk.map(Number)
    : params.bhk
    ? [Number(params.bhk)]
    : [];
  if (bhks.length > 0) where.bhk = { in: bhks };

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = Number(params.minPrice);
    if (params.maxPrice) where.price.lte = Number(params.maxPrice);
  }

  const furnishings = Array.isArray(params.furnishing)
    ? params.furnishing
    : params.furnishing
    ? [params.furnishing]
    : [];
  if (furnishings.length > 0) where.furnishing = { in: furnishings };

  if (params.verified === "true") where.verified = true;

  let orderBy: any = { createdAt: "desc" };
  switch (params.sortBy) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
    case "oldest": orderBy = { createdAt: "asc" }; break;
    case "area_asc": orderBy = { area: "asc" }; break;
    case "area_desc": orderBy = { area: "desc" }; break;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { properties: properties.map(deserializeProperty), total, page, totalPages: Math.ceil(total / limit) };
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const { properties, total, page, totalPages } = await getProperties(searchParams);
  const view = searchParams.view ?? "grid";

  const title = searchParams.city
    ? `Properties in ${searchParams.city}`
    : searchParams.listingType === "BUY"
    ? "Properties for Sale"
    : searchParams.listingType === "RENT"
    ? "Properties for Rent"
    : "All Properties";

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{title}</h1>
              <p className="text-sm text-slate-500">
                {total.toLocaleString("en-IN")} properties found
                {searchParams.search && ` for "${searchParams.search}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <Suspense><SortDropdown current={searchParams.sortBy} /></Suspense>
              {/* View toggle */}
              <ViewToggle current={view} searchParams={searchParams} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Suspense>
              <PropertyFilters className="sticky top-20" />
            </Suspense>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {properties.length === 0 ? (
              <EmptyState searchParams={searchParams} />
            ) : (
              <>
                <div className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }>
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property as any}
                      variant={view === "list" ? "list" : "grid"}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    searchParams={searchParams}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

    </div>
  );
}


function ViewToggle({
  current,
  searchParams,
}: {
  current: string;
  searchParams: Record<string, any>;
}) {
  const makeHref = (view: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    params.set("view", view);
    return `/properties?${params.toString()}`;
  };

  return (
    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
      <Link
        href={makeHref("grid")}
        className={`p-2 ${current === "grid" ? "bg-primary-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
      >
        <LayoutGrid className="w-4 h-4" />
      </Link>
      <Link
        href={makeHref("list")}
        className={`p-2 ${current === "list" ? "bg-primary-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
      >
        <List className="w-4 h-4" />
      </Link>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, any>;
}) {
  const makeHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    params.set("page", String(p));
    return `/properties?${params.toString()}`;
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="btn-secondary py-2 px-3">
          <ChevronLeft className="w-4 h-4" />
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
            p === page
              ? "bg-primary-800 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
          }`}
        >
          {p}
        </Link>
      ))}

      {page < totalPages && (
        <Link href={makeHref(page + 1)} className="btn-secondary py-2 px-3">
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ searchParams }: { searchParams: Record<string, any> }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No properties found</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6">
        We couldn't find properties matching your criteria. Try adjusting your filters.
      </p>
      <Link href="/properties" className="btn-primary inline-flex">
        Clear Filters
      </Link>
    </div>
  );
}
