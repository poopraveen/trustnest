"use client";

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "@/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Zap } from "lucide-react";

interface Props {
  productId: string;
  title: string;
  price: number;
  image: string | null;
  stock: number;
}

export default function AddToCartButton({ productId, title, price, image, stock }: Props) {
  const { addItem, openCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  if (stock <= 0) {
    return (
      <div className="mt-4">
        <button disabled className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-medium cursor-not-allowed text-sm">
          Out of Stock
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ productId, title, price, image, stock });
    openCart();
  };

  const handleBuyNow = () => {
    addItem({ productId, title, price, image, stock });
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm transition-colors"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary-700 text-primary-700 hover:bg-primary-50 font-semibold text-sm transition-colors"
      >
        <Zap className="w-4 h-4" />
        Buy Now
      </button>
    </div>
  );
}
