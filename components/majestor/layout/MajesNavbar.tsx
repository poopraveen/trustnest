"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Zap } from "lucide-react";
import { useCartStore, useSearchStore } from "@/lib/majestor/store";
import SearchModal from "../search/SearchModal";

const NAV = [
  { label: "Home", href: "/majestor" },
  { label: "Shop", href: "/majestor/shop" },
  { label: "Collections", href: "/majestor/shop" },
  { label: "About Us", href: "/majestor/about" },
  { label: "Contact", href: "/majestor/contact" },
];

export default function MajesNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore(s => s.totalItems());
  const openCart = useCartStore(s => s.openCart);
  const openSearch = useSearchStore(s => s.openSearch);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0a0c10]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/majestor" className="flex items-center gap-2 mr-4 shrink-0">
            <div className="w-8 h-8 rounded bg-[#00e5a0] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0a0c10]" />
            </div>
            <span className="text-white font-black text-lg tracking-tighter hidden sm:block">MAJESTRONICZ</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {NAV.map(link => (
              <Link key={link.href + link.label} href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00e5a0] transition-colors rounded-lg hover:bg-white/5">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex-1 lg:flex-none" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/login"
              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={openCart}
              className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#00e5a0] text-[#0a0c10] text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#0d1117] border-t border-white/5 px-4 py-3 flex flex-col gap-1">
            {NAV.map(link => (
              <Link key={link.href + link.label} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-[#00e5a0] hover:bg-white/5 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <SearchModal />
    </>
  );
}
