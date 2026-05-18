export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { prisma } from "@/lib/prisma";
import { List, Search, LayoutGrid, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Link } from "@/navigation";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Marketplace — Shop Home & Garden Products | TrustNest",
  description: "Browse flower pot stands, garden decor, furniture, plants and more. Buy directly from verified sellers.",
};

interface PageProps {
  searchParams: {
    category?: string | string[];
    condition?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sortBy?: string;
    page?: string;
    view?: string;
  };
}

async function getProducts(params: PageProps["searchParams"]) {
  const page = Number(params.page ?? 1);
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = { status: "APPROVED" };

  const categories = Array.isArray(params.category)
    ? params.category
    : params.category
    ? [params.category]
    : [];
  if (categories.length > 0) where.category = { in: categories };

  const conditions = Array.isArray(params.condition)
    ? params.condition
    : params.condition
    ? [params.condition]
    : [];
  if (conditions.length > 0) where.condition = { in: conditions };

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = Number(params.minPrice);
    if (params.maxPrice) where.price.lte = Number(params.maxPrice);
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  switch (params.sortBy) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "oldest": orderBy = { createdAt: "asc" }; break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const { products, total, page, totalPages } = await getProducts(searchParams);
  const view = searchParams.view ?? "grid";

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-700" />
                Marketplace
              </h1>
              <p className="text-sm text-slate-500">
                {total.toLocaleString("en-IN")} products found
                {searchParams.search && ` for "${searchParams.search}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MarketplaceSortDropdown current={searchParams.sortBy} searchParams={searchParams} />
              <ViewToggle current={view} searchParams={searchParams} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Suspense>
              <ProductFilters className="sticky top-20" />
            </Suspense>
          </aside>

          <main className="flex-1 min-w-0">
            {products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-4"
                }>
                  {products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product as unknown as Product}
                      variant={view === "list" ? "list" : "grid"}
                    />
                  ))}
                </div>
                {totalPages > 1 && <Pagination page={page} totalPages={totalPages} searchParams={searchParams} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MarketplaceSortDropdown({ current, searchParams }: { current?: string; searchParams: Record<string, any> }) {
  const options = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "oldest", label: "Oldest First" },
  ];
  const makeHref = (sort: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    );
    params.set("sortBy", sort);
    params.set("page", "1");
    return `/marketplace?${params.toString()}`;
  };
  const currentLabel = options.find((o) => o.value === current)?.label ?? "Newest First";

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-slate-500 hidden sm:inline">Sort:</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <Link
            key={opt.value}
            href={makeHref(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              (current ?? "newest") === opt.value
                ? "bg-primary-800 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({ current, searchParams }: { current: string; searchParams: Record<string, any> }) {
  const makeHref = (view: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    );
    params.set("view", view);
    return `/marketplace?${params.toString()}`;
  };
  return (
    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
      <Link href={makeHref("grid")} className={`p-2 ${current === "grid" ? "bg-primary-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
        <LayoutGrid className="w-4 h-4" />
      </Link>
      <Link href={makeHref("list")} className={`p-2 ${current === "list" ? "bg-primary-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
        <List className="w-4 h-4" />
      </Link>
    </div>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, any> }) {
  const makeHref = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    );
    params.set("page", String(p));
    return `/marketplace?${params.toString()}`;
  };
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  });
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 && <Link href={makeHref(page - 1)} className="btn-secondary py-2 px-3"><ChevronLeft className="w-4 h-4" /></Link>}
      {pages.map((p) => (
        <Link key={p} href={makeHref(p)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${p === page ? "bg-primary-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"}`}>{p}</Link>
      ))}
      {page < totalPages && <Link href={makeHref(page + 1)} className="btn-secondary py-2 px-3"><ChevronRight className="w-4 h-4" /></Link>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No products found</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6">Try adjusting your filters or search terms.</p>
      <Link href="/marketplace" className="btn-primary inline-flex">Clear Filters</Link>
    </div>
  );
}
