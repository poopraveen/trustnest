"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import Image from "next/image";
import { ShoppingCart, CheckCircle, Phone, MapPin, FileText, Loader2, User } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/navigation";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="card p-10 text-center max-w-sm w-full">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 text-sm mb-6">Add some products before checking out.</p>
          <Link href="/marketplace" className="btn-primary block text-center">Browse Marketplace</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="card p-10 text-center max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed!</h2>
          <p className="text-slate-500 text-sm mb-1">
            Order ID: <span className="font-mono font-semibold">{success.slice(-8).toUpperCase()}</span>
          </p>
          <p className="text-slate-500 text-sm mb-6">
            The seller will call you on the number you provided.
          </p>
          <div className="space-y-3">
            {session && (
              <Link href="/orders" className="btn-primary block text-center">Track My Orders</Link>
            )}
            <Link href="/marketplace" className="btn-secondary block text-center">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          address: address || null,
          notes: notes || null,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            title: i.title,
            image: i.image,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to place order"); return; }
      clearCart();
      setSuccess(data.orderId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary-700" />
          Checkout
        </h1>
        {!session && (
          <p className="text-sm text-slate-500 mb-6">
            No account needed — just leave your number and the seller will call you.{" "}
            <Link href="/login?callbackUrl=/checkout" className="text-primary-700 hover:underline">
              Sign in
            </Link>{" "}
            to track orders later.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Your Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                    className="input"
                  />
                  <p className="text-xs text-slate-400 mt-1">Seller will call you on this number</p>
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Delivery Address <span className="text-slate-400 text-sm font-normal">(optional)</span>
                </h2>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, City, State, Pincode"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Notes <span className="text-slate-400 text-sm font-normal">(optional)</span>
                </h2>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions for the seller..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                  : `Place Order — ${formatPrice(total)}`
                }
              </button>

              <p className="text-xs text-center text-slate-400">
                Payment is handled directly with the seller on delivery or pickup.
              </p>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-20">
              <h2 className="font-semibold text-slate-800 mb-4">
                Order Summary ({items.length} item{items.length !== 1 ? "s" : ""})
              </h2>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 text-slate-300 m-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-xl font-bold text-primary-800">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
