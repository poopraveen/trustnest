import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import Image from "next/image";
import { formatPrice, getProductCategoryLabel, getConditionLabel, timeAgo } from "@/lib/utils";
import { Plus, Package, Eye } from "lucide-react";

export default async function SellerProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({
    where: { sellerId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border border-red-200",
    SOLD_OUT: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products listed</p>
        </div>
        <Link href="/seller/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">No products yet</h3>
          <p className="text-slate-500 text-sm mb-6">Post your first product to start selling.</p>
          <Link href="/seller/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post Your First Product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.title} width={48} height={48} className="object-cover w-full h-full" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300 m-3" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm line-clamp-1">{product.title}</p>
                        <p className="text-xs text-slate-400">{timeAgo(product.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{getProductCategoryLabel(product.category)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800 text-sm">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {product.views}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {product.status === "APPROVED" && (
                        <Link href={`/products/${product.id}`} className="text-xs text-primary-700 hover:underline">
                          View
                        </Link>
                      )}
                      <Link href={`/api/products/${product.id}`} className="text-xs text-slate-500 hover:text-slate-700">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
