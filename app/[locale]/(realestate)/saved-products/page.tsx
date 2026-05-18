import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import ProductCard from "@/components/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";

export default async function SavedProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const saved = await prisma.savedProduct.findMany({
    where: { userId: session!.user.id },
    include: {
      product: {
        include: { seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = saved.map((s: any) => s.product);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Saved Products</h1>
            <p className="text-sm text-slate-500">{products.length} product{products.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="card p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No saved products</h3>
            <p className="text-slate-500 text-sm mb-6">Browse the marketplace and save products you like.</p>
            <Link href="/marketplace" className="btn-primary inline-flex">Browse Marketplace</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product as unknown as Product}
                saved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
