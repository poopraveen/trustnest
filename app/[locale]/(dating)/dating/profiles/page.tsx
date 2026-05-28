"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/dating/ProfileCard";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Link } from "@/navigation";

interface Profile {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  bio?: string | null;
  photos: string[];
  height?: number | null;
  religion?: string | null;
  education?: string | null;
  occupation?: string | null;
  goals: string;
  hasChildren: boolean;
  liked?: boolean;
}

export default function ProfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    gender: "",
    city: "",
    minAge: "",
    maxAge: "",
  });
  const [applied, setApplied] = useState(filters);

  const fetchProfiles = useCallback(async (f: typeof filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.gender) params.set("gender", f.gender);
      if (f.city) params.set("city", f.city);
      if (f.minAge) params.set("minAge", f.minAge);
      if (f.maxAge) params.set("maxAge", f.maxAge);

      const res = await fetch(`/api/dating/profiles?${params}`);
      if (res.status === 403) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch {
      toast("Failed to load profiles", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchProfiles(applied);
  }, [status, router, fetchProfiles, applied]);

  const handleApplyFilters = () => {
    setApplied(filters);
    setShowFilters(false);
  };

  const handleLikeToggle = (profileId: string, liked: boolean) => {
    setProfiles((prev) => prev.map((p) => (p.id === profileId ? { ...p, liked } : p)));
  };

  if (status === "loading" || (loading && profiles.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <p className="text-slate-700 mb-4">{error}</p>
          {error.includes("profile") && (
            <Link href="/dating/setup" className="bg-rose-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-rose-600">
              Set Up Profile
            </Link>
          )}
          {error.includes("verif") && (
            <Link href="/dating/pending" className="bg-amber-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-amber-600">
              Check Verification
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discover People</h1>
            <p className="text-slate-500 text-sm">{profiles.length} verified members near you</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-rose-300 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(applied.gender || applied.city || applied.minAge || applied.maxAge) && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Filter Profiles</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                  className="input-base text-sm"
                >
                  <option value="">Any</option>
                  <option value="MALE">Men</option>
                  <option value="FEMALE">Women</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Any city"
                    className="input-base pl-9 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Min Age</label>
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => setFilters((f) => ({ ...f, minAge: e.target.value }))}
                  placeholder="18"
                  min="18"
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max Age</label>
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => setFilters((f) => ({ ...f, maxAge: e.target.value }))}
                  placeholder="60"
                  max="100"
                  className="input-base text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setFilters({ gender: "", city: "", minAge: "", maxAge: "" }); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 text-sm bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Profiles Found</h2>
            <p className="text-slate-500 mb-6">Try adjusting your filters or check back later as more members join.</p>
            <button
              onClick={() => { setFilters({ gender: "", city: "", minAge: "", maxAge: "" }); setApplied({ gender: "", city: "", minAge: "", maxAge: "" }); }}
              className="bg-rose-100 text-rose-700 px-6 py-2.5 rounded-full font-medium hover:bg-rose-200"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} onLikeToggle={handleLikeToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
