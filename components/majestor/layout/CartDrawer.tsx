"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/majestor/store";
import { formatPrice } from "@/lib/majestor/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalItems } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0d1117] border-l border-white/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#00e5a0]" />
            <span className="font-bold text-white">Cart ({totalItems()})</span>
          </div>
          <button onClick={closeCart} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Your cart is empty</p>
              <p className="text-slate-600 text-sm mt-1">Add some electronics to get started!</p>
              <button onClick={closeCart} className="mt-4 text-sm text-[#00e5a0] hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.slug} className="flex gap-3 bg-white/5 rounded-xl p-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium leading-tight line-clamp-2 mb-1">
                    {item.product.name}
                  </p>
                  <p className="text-[#00e5a0] font-bold text-sm">
                    {formatPrice(item.product.salePrice)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQty(item.product.slug, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-white text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.slug, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.slug)}
                      className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-white font-bold text-sm shrink-0">
                  {formatPrice(item.product.salePrice * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 space-y-3">
            {totalPrice() < 999 && (
              <p className="text-xs text-slate-400 text-center">
                Add{" "}
                <span className="text-[#00e5a0] font-bold">{formatPrice(999 - totalPrice())}</span>
                {" "}more for free shipping (TN prepaid)
              </p>
            )}
            <div className="flex items-center justify-between text-white">
              <span className="font-semibold">Subtotal</span>
              <span className="font-black text-lg">{formatPrice(totalPrice())}</span>
            </div>
            <Link href="/majestor/cart" onClick={closeCart}
              className="w-full block text-center py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors border border-white/10">
              View Cart
            </Link>
            <Link href="/majestor/checkout" onClick={closeCart}
              className="w-full block text-center py-3 rounded-xl bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] font-black text-sm transition-colors">
              Checkout →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
