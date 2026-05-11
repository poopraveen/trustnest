"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "@/components/ui/Toaster";
import { Loader2, Sparkles, MapPin, Home, IndianRupee, Info } from "lucide-react";
import { AMENITIES_LIST, INDIAN_CITIES } from "@/lib/utils";

const STEPS = ["Basic Info", "Location", "Details", "Photos & Amenities", "Review"];

export default function NewPropertyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    priceNegotiable: false,
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    bhk: "2",
    bathrooms: "2",
    area: "",
    areaUnit: "sqft",
    floor: "",
    totalFloors: "",
    propertyType: "APARTMENT",
    listingType: "BUY",
    furnishing: "SEMI_FURNISHED",
    parking: false,
    facing: "",
    ageOfProperty: "",
    images: [] as string[],
    amenities: [] as string[],
  });

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const generateDescription = async () => {
    if (!form.title || !form.city) {
      toast("Please fill in title and city first", "warning");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          bhk: Number(form.bhk),
          area: Number(form.area),
          city: form.city,
          amenities: form.amenities,
          price: Number(form.price),
        }),
      });
      const data = await res.json();
      if (data.description) {
        update("description", data.description);
        toast("AI description generated!", "success");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          bhk: Number(form.bhk),
          bathrooms: Number(form.bathrooms),
          area: Number(form.area),
          floor: form.floor ? Number(form.floor) : null,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
          ageOfProperty: form.ageOfProperty ? Number(form.ageOfProperty) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Failed to submit property", "error");
        return;
      }
      toast("Property submitted for review! We'll notify you once approved.", "success");
      router.push("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return form.title && form.listingType && form.propertyType && form.price;
    if (step === 1) return form.address && form.city && form.state && form.pincode;
    if (step === 2) return form.bhk && form.bathrooms && form.area;
    if (step === 3) return form.images.length >= 1;
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Post a New Property</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in the details to list your property</p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step
                    ? "text-primary-700"
                    : i < step
                    ? "text-emerald-600 cursor-pointer"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === step ? "bg-primary-700 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-bold text-slate-800 text-lg">Basic Information</h2>

            {/* Listing type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Listing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {["BUY", "RENT"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update("listingType", type)}
                    className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                      form.listingType === type
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-200 text-slate-500 hover:border-primary-300"
                    }`}
                  >
                    {type === "BUY" ? "For Sale" : "For Rent"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Title *</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g., Spacious 3 BHK Apartment near Metro"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property Type *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { value: "APARTMENT", label: "Apartment" },
                  { value: "VILLA", label: "Villa" },
                  { value: "INDEPENDENT_HOUSE", label: "Indep. House" },
                  { value: "PLOT", label: "Plot/Land" },
                  { value: "COMMERCIAL", label: "Commercial" },
                  { value: "PG", label: "PG/Hostel" },
                  { value: "STUDIO", label: "Studio" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => update("propertyType", type.value)}
                    className={`py-2.5 px-3 text-sm rounded-xl border-2 font-medium transition-all ${
                      form.propertyType === type.value
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-slate-200 text-slate-500 hover:border-primary-300"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder={form.listingType === "RENT" ? "25000" : "5000000"}
                    className="input-base pl-7"
                  />
                </div>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.priceNegotiable}
                    onChange={(e) => update("priceNegotiable", e.target.checked)}
                    className="w-4 h-4 accent-primary-700"
                  />
                  <span className="text-sm text-slate-700">Price Negotiable</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-bold text-slate-800 text-lg">Location Details</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Address *</label>
              <input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="House/Flat no., Street, Building name"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Locality / Area *</label>
              <input
                value={form.locality}
                onChange={(e) => update("locality", e.target.value)}
                placeholder="e.g., Bandra West, Koramangala"
                className="input-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="input-base"
                >
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State *</label>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="Maharashtra"
                  className="input-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">PIN Code *</label>
              <input
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
                placeholder="400001"
                maxLength={6}
                className="input-base max-w-xs"
              />
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-bold text-slate-800 text-lg">Property Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">BHK *</label>
                <select value={form.bhk} onChange={(e) => update("bhk", e.target.value)} className="input-base">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bathrooms *</label>
                <select value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className="input-base">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Super Area *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                    placeholder="1200"
                    className="input-base"
                  />
                  <select value={form.areaUnit} onChange={(e) => update("areaUnit", e.target.value)} className="input-base w-24">
                    <option value="sqft">sqft</option>
                    <option value="sqm">sqm</option>
                    <option value="acres">acres</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Floor No.</label>
                <input
                  type="number"
                  value={form.floor}
                  onChange={(e) => update("floor", e.target.value)}
                  placeholder="e.g., 5"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Floors</label>
                <input
                  type="number"
                  value={form.totalFloors}
                  onChange={(e) => update("totalFloors", e.target.value)}
                  placeholder="e.g., 20"
                  className="input-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Furnishing</label>
                <select value={form.furnishing} onChange={(e) => update("furnishing", e.target.value)} className="input-base">
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Facing</label>
                <select value={form.facing} onChange={(e) => update("facing", e.target.value)} className="input-base">
                  <option value="">Select</option>
                  {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Age (years)</label>
                <input
                  type="number"
                  value={form.ageOfProperty}
                  onChange={(e) => update("ageOfProperty", e.target.value)}
                  placeholder="0 = new"
                  className="input-base"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.parking}
                onChange={(e) => update("parking", e.target.checked)}
                className="w-4 h-4 accent-primary-700"
              />
              <span className="text-sm font-medium text-slate-700">Covered Parking Available</span>
            </label>
          </div>
        )}

        {/* Step 3: Photos & Amenities */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-1">Photos</h2>
              <p className="text-sm text-slate-500 mb-4">
                Add at least 3 photos to increase visibility. First photo will be the cover.
              </p>
              <ImageUpload
                value={form.images}
                onChange={(urls) => update("images", urls)}
                maxImages={15}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800 text-lg">Description</h2>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-800 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  AI Generate
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                placeholder="Describe the property — highlights, neighbourhood, nearby landmarks, unique features..."
                className="input-base resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{form.description.length}/2000 characters</p>
            </div>

            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      form.amenities.includes(amenity)
                        ? "bg-primary-100 text-primary-800 border-primary-300"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary-300"
                    }`}
                  >
                    {form.amenities.includes(amenity) && "✓ "}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-bold text-slate-800 text-lg">Review & Submit</h2>
            <div className="bg-slate-50 rounded-xl p-5 space-y-4">
              <ReviewRow label="Title" value={form.title} />
              <ReviewRow label="Type" value={`${form.listingType === "BUY" ? "For Sale" : "For Rent"} · ${form.propertyType}`} />
              <ReviewRow label="Price" value={`₹${Number(form.price).toLocaleString("en-IN")}`} />
              <ReviewRow label="Location" value={`${form.locality}, ${form.city}, ${form.state} – ${form.pincode}`} />
              <ReviewRow label="Property" value={`${form.bhk} BHK · ${form.bathrooms} Bath · ${form.area} ${form.areaUnit}`} />
              <ReviewRow label="Photos" value={`${form.images.length} photo(s) uploaded`} />
              <ReviewRow label="Amenities" value={form.amenities.join(", ") || "None selected"} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Your property will be reviewed by our team within 24 hours. You'll be notified
                once it's approved and goes live.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-sm text-slate-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}
