"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Search, MapPin, Home, IndianRupee } from "lucide-react";
import { INDIAN_CITIES } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("BUY");
  const [bhk, setBhk] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (city) params.set("city", city);
    if (listingType) params.set("listingType", listingType);
    if (bhk) params.set("bhk", bhk);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex mb-0">
        {["BUY", "RENT"].map((type) => (
          <button
            key={type}
            onClick={() => setListingType(type)}
            className={`px-8 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
              listingType === type
                ? "bg-white text-primary-800"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {type === "BUY" ? "Buy" : "Rent"}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* City */}
          <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-xl px-3 py-2.5">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 text-sm text-slate-700 focus:outline-none bg-transparent"
            >
              <option value="">Select City</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 flex-[2] border border-slate-200 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by locality, landmark, project..."
              className="flex-1 text-sm text-slate-700 focus:outline-none bg-transparent"
            />
          </div>

          {/* BHK */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 w-full md:w-36">
            <Home className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="flex-1 text-sm text-slate-700 focus:outline-none bg-transparent"
            >
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </select>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="bg-brand-orange text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-brand-orange-dark transition-colors flex items-center gap-2 justify-center whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
