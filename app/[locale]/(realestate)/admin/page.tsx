export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  Building2, Users, Clock, CheckCircle, TrendingUp, Eye,
  XCircle, Package, ShoppingBag, BarChart3,
} from "lucide-react";
import { Link } from "@/navigation";
import { formatPrice, timeAgo, getProductCategoryLabel, getConditionLabel } from "@/lib/utils";
import AdminDashboardTabs from "@/components/AdminDashboardTabs";

export default async function AdminOverview({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "products" ? "products" : "properties";

  const [
    totalProps, totalUsers, pendingProps, approvedProps, rejectedProps,
    totalProducts, pendingProducts, approvedProducts,
    recentPendingProps, recentPendingProducts,
    propViews, productViews,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.user.count(),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "APPROVED" } }),
    prisma.property.count({ where: { status: "REJECTED" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.property.findMany({
      where: { status: "PENDING" },
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "PENDING" },
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.property.aggregate({ _sum: { views: true } }),
    prisma.product.aggregate({ _sum: { views: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview — properties & marketplace</p>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: "Total Properties", value: totalProps, color: "bg-blue-50 text-blue-700" },
          { icon: Package, label: "Total Products", value: totalProducts, color: "bg-violet-50 text-violet-700" },
          { icon: Users, label: "Registered Users", value: totalUsers, color: "bg-purple-50 text-purple-700" },
          { icon: Clock, label: "Pending Approvals", value: pendingProps + pendingProducts, color: "bg-amber-50 text-amber-700" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${color.split(" ")[0]} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color.split(" ")[1]}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value.toLocaleString("en-IN")}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Views row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{(propViews._sum.views ?? 0).toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Property Views</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{(productViews._sum.views ?? 0).toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">Product Views</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-slate-100">
          <Link
            href="/admin?tab=properties"
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === "properties"
                ? "border-primary-600 text-primary-700 bg-primary-50/40"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Pending Properties
            {pendingProps > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {pendingProps}
              </span>
            )}
          </Link>
          <Link
            href="/admin?tab=products"
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === "products"
                ? "border-violet-600 text-violet-700 bg-violet-50/40"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package className="w-4 h-4" />
            Pending Products
            {pendingProducts > 0 && (
              <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-bold">
                {pendingProducts}
              </span>
            )}
          </Link>
        </div>

        {/* Tab content */}
        {tab === "properties" ? (
          <div>
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Showing latest {recentPendingProps.length} pending properties</p>
              <Link href="/admin/properties" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                Manage all →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPendingProps.map((prop) => (
                <div key={prop.id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {prop.images[0] ? (
                      <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{prop.title}</p>
                    <p className="text-xs text-slate-500">
                      by {prop.seller.name ?? prop.seller.email} · {prop.city} · {formatPrice(prop.price)} · {timeAgo(prop.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AdminDashboardTabs entityId={prop.id} entityType="property" />
                  </div>
                </div>
              ))}
              {recentPendingProps.length === 0 && (
                <div className="py-10 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">All caught up!</p>
                  <p className="text-sm text-slate-400">No pending property approvals</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Showing latest {recentPendingProducts.length} pending products</p>
              <Link href="/admin/products" className="text-xs text-violet-600 hover:text-violet-800 font-medium">
                Manage all →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPendingProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {(product.images as string[])[0] ? (
                      <img src={(product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{product.title}</p>
                    <p className="text-xs text-slate-500">
                      by {product.seller.name ?? product.seller.email} · {getProductCategoryLabel(product.category)} · {formatPrice(product.price)} · {timeAgo(product.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AdminDashboardTabs entityId={product.id} entityType="product" />
                  </div>
                </div>
              ))}
              {recentPendingProducts.length === 0 && (
                <div className="py-10 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">All caught up!</p>
                  <p className="text-sm text-slate-400">No pending product approvals</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Properties</p>
          <div className="space-y-2">
            {[
              { label: "Approved", value: approvedProps, color: "text-emerald-600" },
              { label: "Pending", value: pendingProps, color: "text-amber-600" },
              { label: "Rejected", value: rejectedProps, color: "text-red-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Products</p>
          <div className="space-y-2">
            {[
              { label: "Approved", value: approvedProducts, color: "text-emerald-600" },
              { label: "Pending", value: pendingProducts, color: "text-amber-600" },
              { label: "Total", value: totalProducts, color: "text-slate-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Quick Links</p>
          <div className="space-y-2">
            <Link href="/admin/properties" className="flex justify-between items-center hover:text-primary-700 transition-colors">
              <span className="text-xs text-slate-500">Manage Properties</span>
              <span className="text-xs text-primary-600">→</span>
            </Link>
            <Link href="/admin/products" className="flex justify-between items-center hover:text-violet-700 transition-colors">
              <span className="text-xs text-slate-500">Manage Products</span>
              <span className="text-xs text-violet-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
