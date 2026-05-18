"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "@/navigation";
import Image from "next/image";
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-700" />
            <h2 className="text-lg font-bold text-slate-800">Cart</h2>
            {count > 0 && (
              <span className="bg-primary-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Your cart is empty</p>
              <p className="text-slate-400 text-sm mt-1">Add products from the marketplace</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex gap-3 bg-slate-50 rounded-xl p-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-slate-300 m-5" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">{item.title}</p>
                  <p className="text-sm font-bold text-primary-700 mt-1">{formatPrice(item.price)}</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary-400 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold text-slate-800 w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-primary-400 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Total</span>
              <span className="text-xl font-bold text-primary-800">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-slate-400">
              No account needed — seller will call you directly
            </p>
          </div>
        )}
      </div>
    </>
  );
}
