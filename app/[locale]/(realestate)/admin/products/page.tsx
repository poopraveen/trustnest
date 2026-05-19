"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice, getProductCategoryLabel, getConditionLabel, timeAgo } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, Package, Loader2, Star, Trash2, EyeOff, RotateCcw } from "lucide-react";
import { Link } from "@/navigation";
import { toast } from "@/components/ui/Toaster";

interface ProductWithSeller {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  featured: boolean;
  disabled: boolean;
  views: number;
  images: string[];
  createdAt: string;
  seller: { name: string | null; email: string };
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "DECOMMISSIONED";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDecommission, setConfirmDecommission] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  async function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    params.set("limit", "50");
    params.set("page", "1");
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast(
        status === "APPROVED" ? "Product approved!" :
        status === "REJECTED" ? "Product rejected" :
        status === "DECOMMISSIONED" ? "Product decommissioned" :
        "Status updated",
        status === "APPROVED" ? "success" : "warning"
      );
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    }
    setActionId(null);
    setConfirmDecommission(null);
  }

  async function toggleDisabled(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !current }),
    });
    toast(!current ? "Product disabled temporarily" : "Product enabled", !current ? "warning" : "success");
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, disabled: !current } : p));
  }

  async function deleteProduct(id: string) {
    setActionId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Product deleted permanently", "error");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setConfirmDelete(null);
    setActionId(null);
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    });
    toast(!current ? "Product featured!" : "Removed from featured", "success");
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, featured: !current } : p));
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    APPROVED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-600",
    SOLD_OUT: "bg-slate-50 text-slate-600",
    DECOMMISSIONED: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
          <p className="text-sm text-slate-500">Review and approve product listings</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED", "DECOMMISSIONED"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-primary-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No products in this category.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Seller</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.title} width={56} height={56} className="object-cover w-full h-full" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300 m-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm line-clamp-1 max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-slate-400">{getProductCategoryLabel(product.category)} · {getConditionLabel(product.condition)}</p>
                        <p className="text-xs text-slate-400">{timeAgo(new Date(product.createdAt))}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-slate-700">{product.seller.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{product.seller.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800 text-sm">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[product.status] ?? "bg-slate-50 text-slate-600"}`}>
                        {product.status}
                      </span>
                      {product.disabled && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(product.id, "APPROVED")}
                            disabled={actionId === product.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            {actionId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => updateStatus(product.id, "REJECTED")}
                            disabled={actionId === product.id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {product.status === "APPROVED" && (
                        <>
                          <button
                            onClick={() => toggleFeatured(product.id, product.featured)}
                            className={`p-1.5 rounded-lg transition-colors ${product.featured ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:bg-slate-100"}`}
                            title={product.featured ? "Unfeature" : "Feature"}
                          >
                            <Star className={`w-4 h-4 ${product.featured ? "fill-current" : ""}`} />
                          </button>
                          <Link href={`/products/${product.id}`} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleDisabled(product.id, product.disabled)}
                            title={product.disabled ? "Enable listing" : "Disable temporarily"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.disabled
                                ? "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                            }`}
                          >
                            {product.disabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDecommission(product.id)}
                            disabled={actionId === product.id}
                            className="p-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Decommission product"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {product.status === "DECOMMISSIONED" && (
                        <button
                          onClick={() => updateStatus(product.id, "APPROVED")}
                          disabled={actionId === product.id}
                          className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 text-xs font-medium px-2"
                          title="Commission back (make live again)"
                        >
                          {actionId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                          Commission Back
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmDelete(product.id)}
                        disabled={actionId === product.id}
                        className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decommission confirm modal */}
      {confirmDecommission && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDecommission(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Decommission Product?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                The listing will be hidden from public view immediately. You can commission it back later.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDecommission(null)} className="flex-1 btn-secondary py-2.5">Cancel</button>
                <button
                  onClick={() => updateStatus(confirmDecommission, "DECOMMISSIONED")}
                  disabled={actionId === confirmDecommission}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionId === confirmDecommission ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Decommission
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Product?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                This will permanently remove the product and all its enquiries. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 btn-secondary py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProduct(confirmDelete)}
                  disabled={actionId === confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {actionId === confirmDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
