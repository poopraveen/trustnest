import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PropertyGallery from "@/components/PropertyGallery";
import ContactSellerCard from "@/components/ContactSellerCard";
import { formatPrice, getProductCategoryLabel, getConditionLabel, timeAgo } from "@/lib/utils";
import { Tag, Package, Ruler, Weight, Truck, CheckCircle, Eye, BadgeCheck, Star, Calendar } from "lucide-react";
import Image from "next/image";
import { Link } from "@/navigation";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | TrustNest Marketplace`,
    description: product.description.slice(0, 160),
    openGraph: { title: product.title, images: product.images[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true, bio: true, createdAt: true } },
    },
  });

  if (!product || product.status !== "APPROVED") notFound();

  await prisma.product.update({ where: { id: params.id }, data: { views: { increment: 1 } } });

  const specs = [
    product.brand && { label: "Brand", value: product.brand, icon: Package },
    { label: "Condition", value: getConditionLabel(product.condition), icon: Star },
    { label: "Category", value: getProductCategoryLabel(product.category), icon: Tag },
    product.material && { label: "Material", value: product.material, icon: Package },
    product.dimensions && { label: "Dimensions", value: product.dimensions, icon: Ruler },
    product.weight && { label: "Weight", value: product.weight, icon: Weight },
  ].filter(Boolean) as { label: string; value: string; icon: any }[];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          <Link href="/marketplace" className="hover:text-primary-700">Marketplace</Link>
          <span>/</span>
          <span className="text-slate-400">{getProductCategoryLabel(product.category)}</span>
          <span>/</span>
          <span className="text-slate-700 line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <PropertyGallery images={product.images} title={product.title} />

            {/* Description */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-start gap-3">
                      <spec.icon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{spec.label}</p>
                        <p className="text-sm text-slate-700 font-medium">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping */}
            {product.shippingInfo && (
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Shipping & Delivery
                </h2>
                <p className="text-slate-600">{product.shippingInfo}</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="mb-3">
                <h1 className="text-xl font-bold text-slate-800 leading-snug">{product.title}</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Tag className="w-3.5 h-3.5" />
                  {getProductCategoryLabel(product.category)}
                </p>
              </div>
              <p className="text-3xl font-bold text-primary-800">
                {formatPrice(product.price)}
              </p>
              {product.priceNegotiable && (
                <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  Price Negotiable
                </span>
              )}
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className={`font-medium px-3 py-1 rounded-full text-xs ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  {product.views} views
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{timeAgo(product.createdAt)}</p>
            </div>

            {/* Contact seller */}
            <ContactSellerCard
              productId={product.id}
              sellerPhone={product.seller.phone}
              sellerName={product.seller.name}
            />

            {/* Seller info */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">About the Seller</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.seller.avatar ? (
                    <Image src={product.seller.avatar} alt={product.seller.name ?? ""} width={40} height={40} className="object-cover" />
                  ) : (
                    <span className="text-primary-700 font-bold text-lg">
                      {(product.seller.name ?? "S")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm flex items-center gap-1">
                    {product.seller.name ?? "Seller"}
                    {product.seller.isVerified && <BadgeCheck className="w-4 h-4 text-primary-600" />}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date((product.seller as any).createdAt).getFullYear()}
                  </p>
                </div>
              </div>
              {product.seller.isVerified && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Verified Seller
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
