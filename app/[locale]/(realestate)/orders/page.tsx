import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import Image from "next/image";
import { Package, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:    { label: "Pending",    color: "bg-amber-50 text-amber-700 border-amber-200",    icon: Clock },
  CONFIRMED:  { label: "Confirmed",  color: "bg-blue-50 text-blue-700 border-blue-200",        icon: CheckCircle },
  PROCESSING: { label: "Processing", color: "bg-purple-50 text-purple-700 border-purple-200",  icon: Package },
  SHIPPED:    { label: "Shipped",    color: "bg-indigo-50 text-indigo-700 border-indigo-200",  icon: Truck },
  DELIVERED:  { label: "Delivered",  color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  CANCELLED:  { label: "Cancelled",  color: "bg-red-50 text-red-700 border-red-200",           icon: XCircle },
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: {
      items: {
        include: { product: { select: { id: true, title: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-6 h-6 text-primary-700" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
            <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="card p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No orders yet</h3>
            <p className="text-slate-500 text-sm mb-6">Place your first order from the marketplace.</p>
            <Link href="/marketplace" className="btn-primary inline-flex">Browse Marketplace</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={order.id} className="card p-5">
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-slate-800 font-mono text-sm">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(order.createdAt)}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {item.image || item.product?.images?.[0] ? (
                            <Image
                              src={item.image ?? item.product.images[0]}
                              alt={item.title}
                              width={48} height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300 m-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p>📞 {order.phone}</p>
                      {order.address && <p>📍 {order.address}</p>}
                    </div>
                    <p className="font-bold text-primary-800">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
