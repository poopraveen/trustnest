"use client";

import { useState } from "react";
import { Phone, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";

interface ContactSellerCardProps {
  productId: string;
  sellerPhone?: string | null;
  sellerName?: string | null;
}

export default function ContactSellerCard({ productId, sellerPhone, sellerName }: ContactSellerCardProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/product-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-800 mb-1">Enquiry Sent!</h3>
        <p className="text-sm text-slate-500">
          {sellerName ? `${sellerName} will` : "The seller will"} contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary-600" />
        Contact Seller
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your Name *"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          className="input-field"
        />
        <input
          type="tel"
          placeholder="Mobile Number *"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder="Message (optional)"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={3}
          className="input-field resize-none"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !form.name || !form.phone}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Sending..." : "Send Enquiry"}
        </button>

        {sellerPhone && (
          <a
            href={`https://wa.me/91${sellerPhone.replace(/\D/g, "")}?text=Hi, I'm interested in your product listed on TrustNest.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            WhatsApp Seller
          </a>
        )}
      </form>
    </div>
  );
}
