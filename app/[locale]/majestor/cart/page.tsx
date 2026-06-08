"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Cpu } from "lucide-react";
import { useCartStore } from "@/lib/majestor/store";
import { formatPrice } from "@/lib/majestor/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, totalItems, clearCart } = useCartStore();

  const subtotal = totalPrice();
  const shipping = subtotal >= 999 ? 0 : 60;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-400 mb-6">Add some electronics to get building!</p>
        <Link href="/majestor/shop"
          className="flex items-center gap-2 px-6 py-3 bg-[#00e5a0] text-[#0a0c10] rounded-xl font-black text-sm hover:bg-[#00cc8e] transition-colors">
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">Cart ({totalItems()})</h1>
        <button onClick={clearCart} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.product.slug} className="flex gap-4 bg-[#0d1117] border border-white/8 rounded-2xl p-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/majestor/products/${item.product.slug}`}
                  className="text-white text-sm font-semibold hover:text-[#00e5a0] transition-colors line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-slate-500 text-xs mt-0.5">{item.product.collection}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                    <button onClick={() => updateQty(item.product.slug, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.slug, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product.slug)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#00e5a0] font-black">{formatPrice(item.product.salePrice * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-slate-600 text-xs">{formatPrice(item.product.salePrice)} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalItems()} items)</span>
                <span className="text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-[#00e5a0] font-semibold" : "text-white font-medium"}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-600">
                  Add {formatPrice(999 - subtotal)} for free shipping (TN prepaid)
                </p>
              )}
            </div>
            <div className="border-t border-white/8 pt-3 flex justify-between mb-5">
              <span className="text-white font-bold">Total</span>
              <span className="text-[#00e5a0] font-black text-lg">{formatPrice(total)}</span>
            </div>
            <Link href="/majestor/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] rounded-xl font-black text-sm transition-colors">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* AI Workshop CTA from cart */}
          <Link href={`/majestor/workshop?components=${items.map(i => i.product.slug).join(",")}`}
            className="flex items-center gap-3 p-4 bg-[#00e5a0]/5 border border-[#00e5a0]/25 rounded-xl hover:bg-[#00e5a0]/10 transition-colors group">
            <div className="w-10 h-10 bg-[#00e5a0]/15 rounded-xl flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 text-[#00e5a0]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-[#00e5a0] transition-colors">AI Project Workshop</p>
              <p className="text-xs text-slate-400">Design a product with your {totalItems()} components</p>
            </div>
            <span className="text-[#00e5a0] ml-auto font-bold text-lg">✦</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
