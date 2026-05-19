import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import PropertyCard from "@/components/PropertyCard";
import { Heart, Home } from "lucide-react";
import { deserializeProperty } from "@/lib/db";

export default async function SavedPropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const saved = await prisma.savedProperty.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: {
          seller: { select: { id: true, name: true, email: true, phone: true, avatar: true, isVerified: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const properties = saved.map((s: any) => deserializeProperty(s.property));

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Saved Properties</h1>
            <p className="text-sm text-slate-500">{properties.length} propert{properties.length !== 1 ? "ies" : "y"} saved</p>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="card p-16 text-center">
            <Home className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No saved properties</h3>
            <p className="text-slate-500 text-sm mb-6">Browse listings and save properties you like.</p>
            <Link href="/properties" className="btn-primary inline-flex">Browse Properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
