"use client";

import { useState, useEffect } from "react";
import {
  Building2, CheckCircle, XCircle, Eye, Trash2, Shield,
  Search, Filter, Star, Loader2,
} from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
  verified: boolean;
  featured: boolean;
  images: string[];
  bhk: number;
  propertyType: string;
  listingType: string;
  createdAt: string;
  seller: { name: string | null; email: string };
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  async function fetchProperties() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    // For admin, we bypass status filter — in production you'd add an admin API
    const res = await fetch(`/api/properties?limit=50&${params.toString()}`);
    // Since we need all properties for admin, we'll use a different approach
    // For now, simulate with the public API
    const data = await res.json();
    setProperties(data.data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast(
          status === "APPROVED" ? "Property approved and live!" : "Property rejected",
          status === "APPROVED" ? "success" : "warning"
        );
        setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleVerified(id: string, current: boolean) {
    setActionLoading(id + "verify");
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !current }),
      });
      if (res.ok) {
        toast(!current ? "Property verified!" : "Verification removed", "success");
        setProperties((prev) => prev.map((p) => p.id === id ? { ...p, verified: !current } : p));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    setActionLoading(id + "feature");
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    });
    if (res.ok) {
      toast(!current ? "Property featured!" : "Removed from featured", "success");
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, featured: !current } : p));
    }
    setActionLoading(null);
  }

  const filtered = properties.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.seller.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Property Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="input-base pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                filter === s
                  ? "bg-primary-700 text-white border-primary-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400">No properties found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Property</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Seller</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        {prop.images[0] ? (
                          <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]">{prop.title}</p>
                        <p className="text-xs text-slate-400">{prop.city} · {prop.bhk} BHK · {timeAgo(new Date(prop.createdAt))}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-semibold text-primary-700">
                    {formatPrice(prop.price)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                    {prop.seller.name ?? prop.seller.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={`badge text-xs ${
                        prop.status === "APPROVED" ? "badge-green" :
                        prop.status === "PENDING" ? "badge-orange" :
                        prop.status === "REJECTED" ? "badge-red" : "badge-gray"
                      }`}>
                        {prop.status}
                      </span>
                      {prop.verified && <span className="badge-blue">✓</span>}
                      {prop.featured && <span className="badge-orange">★</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {prop.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(prop.id, "APPROVED")}
                            disabled={!!actionLoading}
                            className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === prop.id + "APPROVED" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(prop.id, "REJECTED")}
                            disabled={!!actionLoading}
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleVerified(prop.id, prop.verified)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prop.verified ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 hover:bg-blue-100"
                        }`}
                        title={prop.verified ? "Remove verification" : "Verify property"}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFeatured(prop.id, prop.featured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prop.featured ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-amber-100"
                        }`}
                        title={prop.featured ? "Remove featured" : "Mark as featured"}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/properties/${prop.id}`}
                        target="_blank"
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
