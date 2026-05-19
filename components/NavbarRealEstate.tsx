"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  Home, Heart, LayoutDashboard, Settings,
  LogOut, Menu, X, ChevronDown, Plus, Shield, ExternalLink, Globe, ShoppingBag, ShoppingCart, Package, Map, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/BrandWordmark";
import { useCart } from "@/contexts/CartContext";

export default function NavbarRealEstate() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navRe");
  const tc = useTranslations("common");
  const { count: cartCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === "en" ? "ta" : "en" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-nav border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <BrandWordmark className="text-xl text-primary-900" prefixClassName="text-primary-900" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/properties?listingType=BUY"  active={false}>{t("buy")}</NavLink>
            <NavLink href="/properties?listingType=RENT" active={false}>{t("rent")}</NavLink>
            <NavLink href="/properties" active={isActive("/properties")}>{t("allProperties")}</NavLink>
            <NavLink href="/marketplace" active={isActive("/marketplace")}>Marketplace</NavLink>
            <NavLink href="/projects"   active={isActive("/projects")}>{t("newProjects")}</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-2">

            <button
              type="button"
              onClick={switchLocale}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === "en" ? tc("languageTamil") : tc("languageEnglish")}
            </button>

            <Link
              href="/tnvettri"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              {t("tnGovtPortal")}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            {session ? (
              <>
                {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
                  <div className="flex items-center gap-1">
                    <Link href="/seller/properties/new" className="btn-orange text-sm py-2">
                      <Plus className="w-4 h-4" />
                      {t("postProperty")}
                    </Link>
                    <Link href="/seller/products/new" className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                      <Plus className="w-4 h-4" />
                      Post Product
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {/* Cart button */}
                  <button
                    type="button"
                    onClick={openCart}
                    className="relative p-2 text-slate-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary-700 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                  <Link href="/orders" className="p-2 text-slate-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors" title="My Orders">
                    <Package className="w-5 h-5" />
                  </Link>
                  <Link href="/saved" className="p-2 text-slate-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors" title="Saved Properties">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/saved-products" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Saved Products">
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center">
                      {session.user.image ? (
                        <Image src={session.user.image} alt="" width={32} height={32} className="object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-primary-700">
                          {session.user.name?.charAt(0) ?? session.user.email?.charAt(0) ?? "U"}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-fade-in">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-sm text-slate-800 truncate">{session.user.name ?? tc("user")}</p>
                          <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                          <span className={cn(
                            "mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium",
                            session.user.role === "ADMIN"  && "bg-purple-100 text-purple-700",
                            session.user.role === "SELLER" && "bg-orange-100 text-orange-700",
                            session.user.role === "BUYER"  && "bg-blue-100 text-blue-700",
                          )}>
                            {session.user.role}
                          </span>
                        </div>
                        <MenuLink href="/profile"          icon={Settings}       onClick={() => setUserMenuOpen(false)}>{t("myProfile")}</MenuLink>
                        <MenuLink href="/orders"           icon={Package}        onClick={() => setUserMenuOpen(false)}>My Orders</MenuLink>
                        <MenuLink href="/saved"            icon={Heart}          onClick={() => setUserMenuOpen(false)}>{t("savedProperties")}</MenuLink>
                        <MenuLink href="/saved-products"   icon={ShoppingBag}    onClick={() => setUserMenuOpen(false)}>Saved Products</MenuLink>
                        {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
                          <>
                            <MenuLink href="/seller/dashboard" icon={LayoutDashboard} onClick={() => setUserMenuOpen(false)}>{t("sellerDashboard")}</MenuLink>
                            <MenuLink href="/layout-projects" icon={LayoutGrid} onClick={() => setUserMenuOpen(false)}>Layout Projects</MenuLink>
                          </>
                        )}
                        {session.user.role === "ADMIN" && (
                          <>
                            <MenuLink href="/admin" icon={Shield} onClick={() => setUserMenuOpen(false)}>{t("adminPanel")}</MenuLink>
                            <MenuLink href="/layout-projects" icon={Map} onClick={() => setUserMenuOpen(false)}>Layout Projects</MenuLink>
                          </>
                        )}
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />{tc("signOut")}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"    className="text-sm font-medium text-slate-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">{tc("signIn")}</Link>
                <Link href="/register" className="btn-primary text-sm py-2">{tc("getStarted")}</Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={switchLocale}
              className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-2 py-1"
            >
              {locale === "en" ? tc("languageShortTa") : tc("languageShortEn")}
            </button>
            <button type="button" className="p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-2 animate-fade-in">
          <MobileLink href="/properties?listingType=BUY"  onClick={() => setMobileOpen(false)}>{t("buy")}</MobileLink>
          <MobileLink href="/properties?listingType=RENT" onClick={() => setMobileOpen(false)}>{t("rent")}</MobileLink>
          <MobileLink href="/properties"                  onClick={() => setMobileOpen(false)}>{t("allProperties")}</MobileLink>
          <MobileLink href="/marketplace"                 onClick={() => setMobileOpen(false)}>Marketplace</MobileLink>
          <Link href="/tnvettri" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-700 bg-primary-50 rounded-lg">
            <Shield className="w-4 h-4" /> {t("tnGovtPortal")}
          </Link>
          <div className="border-t border-slate-100 pt-3 mt-2">
            {session ? (
              <>
                <MobileLink href="/profile"          onClick={() => setMobileOpen(false)}>{t("myProfile")}</MobileLink>
                <MobileLink href="/orders"           onClick={() => setMobileOpen(false)}>My Orders</MobileLink>
                <MobileLink href="/saved"            onClick={() => setMobileOpen(false)}>{t("savedProperties")}</MobileLink>
                <MobileLink href="/saved-products"   onClick={() => setMobileOpen(false)}>Saved Products</MobileLink>
                {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
                  <>
                    <MobileLink href="/seller/dashboard"     onClick={() => setMobileOpen(false)}>{t("sellerDashboard")}</MobileLink>
                    <MobileLink href="/seller/products/new"  onClick={() => setMobileOpen(false)}>Post a Product</MobileLink>
                    <MobileLink href="/layout-projects"      onClick={() => setMobileOpen(false)}>Layout Projects</MobileLink>
                  </>
                )}
                {session.user.role === "ADMIN" && (
                  <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>{t("adminPanel")}</MobileLink>
                )}
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                  {tc("signOut")}
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login"    onClick={() => setMobileOpen(false)}>{tc("signIn")}</MobileLink>
                <MobileLink href="/register" onClick={() => setMobileOpen(false)}>{tc("register")}</MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", active ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:text-primary-700 hover:bg-slate-50")}>
      {children}
    </Link>
  );
}
function MenuLink({ href, icon: Icon, children, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
      <Icon className="w-4 h-4 text-slate-400" />{children}
    </Link>
  );
}
function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50">
      {children}
    </Link>
  );
}
