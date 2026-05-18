"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "@/components/ui/Toaster";
import { Loader2, Sparkles, ShoppingBag, Tag, IndianRupee, Info } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/utils";

const STEPS = ["Basic Info", "Details", "Photos & Description", "Review"];

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New", desc: "Brand new, unused" },
  { value: "USED", label: "Used", desc: "Previously owned" },
  { value: "REFURBISHED", label: "Refurbished", desc: "Restored to good condition" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    priceNegotiable: false,
    category: "GARDEN_DECOR",
    condition: "NEW",
    stock: "1",
    brand: "",
    material: "",
    dimensions: "",
    weight: "",
    shippingInfo: "",
    images: [] as string[],
  });

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const generateDescription = async () => {
    if (!form.title) {
      toast("Please fill in the product title first", "warning");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          condition: form.condition,
          brand: form.brand || null,
          price: Number(form.price) || 0,
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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          brand: form.brand || null,
          material: form.material || null,
          dimensions: form.dimensions || null,
          weight: form.weight || null,
          shippingInfo: form.shippingInfo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Failed to submit product", "error");
        return;
      }
      toast("Product submitted for review! You'll be notified once approved.", "success");
      router.push("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return form.title && form.category && form.condition && form.price && Number(form.price) > 0;
    if (step === 1) return true; // details optional
    if (step === 2) return form.images.length >= 1 && form.description.length >= 20;
    return true;
  };

  const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Post a New Product</h1>
        <p className="text-slate-500 text-sm mt-0.5">List your product for buyers on the marketplace</p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step ? "text-primary-700" : i < step ? "text-emerald-600 cursor-pointer" : "text-slate-400"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === step ? "bg-primary-700 text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? "bg-emerald-200" : "bg-slate-100"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Basic Information
          </h2>

          <div>
            <label className="label-field">Product Title *</label>
            <input
              type="text"
              placeholder="e.g. Handcrafted Flower Pot Stand — Wrought Iron 3-Tier"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Category *</label>
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input-field">
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-field">Condition *</label>
            <div className="grid grid-cols-3 gap-3">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("condition", opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    form.condition === opt.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-slate-200 hover:border-primary-200"
                  }`}
                >
                  <p className="font-semibold text-slate-800 text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Price (₹) *</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="input-field pl-9"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Stock Quantity</label>
              <input
                type="number"
                placeholder="1"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.priceNegotiable}
              onChange={(e) => update("priceNegotiable", e.target.checked)}
              className="w-4 h-4 accent-primary-700 rounded"
            />
            <span className="text-sm text-slate-700">Price is negotiable</span>
          </label>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            Product Details <span className="text-slate-400 font-normal text-sm">(optional)</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Brand / Make</label>
              <input type="text" placeholder="e.g. Craftsman" value={form.brand} onChange={(e) => update("brand", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Material</label>
              <input type="text" placeholder="e.g. Wrought Iron" value={form.material} onChange={(e) => update("material", e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Dimensions</label>
              <input type="text" placeholder="e.g. 40cm × 40cm × 90cm" value={form.dimensions} onChange={(e) => update("dimensions", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Weight</label>
              <input type="text" placeholder="e.g. 2.5 kg" value={form.weight} onChange={(e) => update("weight", e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="label-field">Shipping Information</label>
            <textarea
              placeholder="e.g. Ships within 2-3 days. Delivery available across Tamil Nadu."
              value={form.shippingInfo}
              onChange={(e) => update("shippingInfo", e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Photos & Description */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Product Photos *</h2>
            <p className="text-sm text-slate-500">Add up to 10 clear photos. First image will be the cover.</p>
            <ImageUpload
              value={form.images}
              onChange={(imgs) => update("images", imgs)}
              maxImages={10}
            />
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Description *</h2>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "Generating..." : "Enhance with AI"}
              </button>
            </div>
            <textarea
              placeholder="Describe your product — material, size, condition, usage, why someone should buy it..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              className="input-field resize-none"
            />
            <p className="text-xs text-slate-400">{form.description.length} / 5000 characters (min 20)</p>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800">Review & Submit</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Basic Info</h3>
              <ReviewRow label="Title" value={form.title} />
              <ReviewRow label="Category" value={PRODUCT_CATEGORIES.find(c => c.value === form.category)?.label ?? form.category} />
              <ReviewRow label="Condition" value={form.condition} />
              <ReviewRow label="Price" value={form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "—"} />
              <ReviewRow label="Stock" value={form.stock} />
              <ReviewRow label="Negotiable" value={form.priceNegotiable ? "Yes" : "No"} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Details</h3>
              <ReviewRow label="Brand" value={form.brand} />
              <ReviewRow label="Material" value={form.material} />
              <ReviewRow label="Dimensions" value={form.dimensions} />
              <ReviewRow label="Weight" value={form.weight} />
              <ReviewRow label="Photos" value={`${form.images.length} uploaded`} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Description</h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed line-clamp-4">{form.description}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            Your product will be reviewed by our team and approved within 24 hours.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40"
        >
          Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!isStepValid()}
            className="btn-primary disabled:opacity-40"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Product"}
          </button>
        )}
      </div>
    </div>
  );
}
