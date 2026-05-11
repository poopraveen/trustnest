export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Building2, Users, Clock, CheckCircle, TrendingUp, Eye, XCircle } from "lucide-react";
import { Link } from "@/navigation";
import { formatPrice, timeAgo } from "@/lib/utils";

export default async function AdminOverview() {
  const [totalProps, totalUsers, pendingProps, approvedProps, rejectedProps, recentProps] =
    await Promise.all([
      prisma.property.count(),
      prisma.user.count(),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.property.count({ where: { status: "APPROVED" } }),
      prisma.property.count({ where: { status: "REJECTED" } }),
      prisma.property.findMany({
        where: { status: "PENDING" },
        include: { seller: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const totalViews = await prisma.property.aggregate({ _sum: { views: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview and property management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: "Total Properties", value: totalProps, color: "bg-blue-50 text-blue-700" },
          { icon: Users, label: "Registered Users", value: totalUsers, color: "bg-purple-50 text-purple-700" },
          { icon: Eye, label: "Total Views", value: totalViews._sum.views ?? 0, color: "bg-emerald-50 text-emerald-700" },
          { icon: Clock, label: "Pending Approval", value: pendingProps, color: "bg-amber-50 text-amber-700" },
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

      {/* Approval queue */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800">Pending Approvals</h2>
            {pendingProps > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {pendingProps}
              </span>
            )}
          </div>
          <Link href="/admin/properties" className="text-sm text-primary-600 hover:text-primary-800">
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-50">
          {recentProps.map((prop) => (
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
                <ApproveButton propertyId={prop.id} />
                <RejectButton propertyId={prop.id} />
                <Link
                  href={`/properties/${prop.id}`}
                  className="text-xs text-primary-600 hover:underline"
                  target="_blank"
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}

          {recentProps.length === 0 && (
            <div className="py-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">All caught up!</p>
              <p className="text-sm text-slate-400">No pending approvals</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Approved", value: approvedProps, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending", value: pendingProps, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Rejected", value: rejectedProps, icon: XCircle, color: "text-red-600 bg-red-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(" ")[1]}`}>
              <Icon className={`w-5 h-5 ${color.split(" ")[0]}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApproveButton({ propertyId }: { propertyId: string }) {
  return (
    <form action={`/api/admin/properties/${propertyId}`} method="PATCH">
      <Link
        href={`/api/admin/properties/${propertyId}?action=approve`}
        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Approve
      </Link>
    </form>
  );
}

function RejectButton({ propertyId }: { propertyId: string }) {
  return (
    <Link
      href={`/api/admin/properties/${propertyId}?action=reject`}
      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
    >
      Reject
    </Link>
  );
}
