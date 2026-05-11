export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { Link } from "@/navigation";
import {
  Building2, Eye, MessageCircle, TrendingUp, PlusCircle,
  CheckCircle, Clock, XCircle, AlertCircle, ArrowUpRight,
} from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    const locale = await getLocale();
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    redirect(`${prefix}/login`);
  }

  const [properties, totalViews] = await Promise.all([
    prisma.property.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.property.aggregate({
      where: { sellerId: session.user.id },
      _sum: { views: true },
    }),
  ]);

  const stats = {
    total: properties.length,
    approved: properties.filter((p) => p.status === "APPROVED").length,
    pending: properties.filter((p) => p.status === "PENDING").length,
    rejected: properties.filter((p) => p.status === "REJECTED").length,
    views: totalViews._sum.views ?? 0,
  };

  const allProperties = await prisma.property.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {session.user.name?.split(" ")[0] ?? "Seller"}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's your property overview</p>
        </div>
        <Link href="/seller/properties/new" className="btn-orange">
          <PlusCircle className="w-4 h-4" />
          Post New Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Listings"
          value={allProperties.length}
          color="bg-blue-50 text-blue-700"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={allProperties.filter((p) => p.status === "APPROVED").length}
          color="bg-emerald-50 text-emerald-700"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={totalViews._sum.views ?? 0}
          color="bg-purple-50 text-purple-700"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={allProperties.filter((p) => p.status === "PENDING").length}
          color="bg-amber-50 text-amber-700"
          iconColor="text-amber-600"
        />
      </div>

      {/* Recent Properties */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Listings</h2>
          <Link href="/seller/properties" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-50">
          {allProperties.slice(0, 8).map((property) => (
            <div key={property.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
              <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {property.images[0] ? (
                  <img
                    src={property.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{property.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {property.city} · {formatPrice(property.price)} · {timeAgo(property.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Eye className="w-3.5 h-3.5" />
                  {property.views}
                </div>
                <StatusBadge status={property.status} />
                <Link
                  href={`/seller/properties/${property.id}/edit`}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}

          {allProperties.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No properties listed yet</p>
              <p className="text-sm text-slate-400 mt-1">Post your first property to get started</p>
              <Link href="/seller/properties/new" className="btn-primary mt-4 inline-flex">
                <PlusCircle className="w-4 h-4" />
                Post Property
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-primary-800">Tips to get more inquiries</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            "Add at least 5 high-quality photos",
            "Write a detailed description (200+ words)",
            "Include all amenities and nearby landmarks",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-primary-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  iconColor,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl ${color.split(" ")[0]} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value.toLocaleString("en-IN")}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "badge-green",
    PENDING: "badge-orange",
    REJECTED: "badge-red",
    SOLD: "badge-blue",
    RENTED: "badge-blue",
  };
  const labels: Record<string, string> = {
    APPROVED: "Live",
    PENDING: "Pending",
    REJECTED: "Rejected",
    SOLD: "Sold",
    RENTED: "Rented",
  };
  return <span className={styles[status] ?? "badge-gray"}>{labels[status] ?? status}</span>;
}
