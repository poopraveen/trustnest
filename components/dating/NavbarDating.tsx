"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/navigation";
import { Heart, Menu, X, User, MessageCircle, LogOut, ChevronDown } from "lucide-react";

export default function NavbarDating() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dating" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            TrustNest Hearts
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <>
              <Link href="/dating/profiles" className="text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors">
                Discover
              </Link>
              <Link href="/dating/matches" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Matches
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="max-w-[100px] truncate">{session.user?.name ?? "Me"}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <Link
                      href="/dating/setup"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-rose-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Edit Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/dating" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/dating/register" className="text-sm font-medium text-slate-600 hover:text-rose-600">
                Join Free
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-rose-50 px-4 py-4 space-y-3">
          {session ? (
            <>
              <Link href="/dating/profiles" className="block text-sm font-medium text-slate-700 py-2">Discover</Link>
              <Link href="/dating/matches" className="block text-sm font-medium text-slate-700 py-2">Matches</Link>
              <Link href="/dating/setup" className="block text-sm font-medium text-slate-700 py-2">Edit Profile</Link>
              <button onClick={() => signOut()} className="block text-sm font-medium text-rose-600 py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/dating/register" className="block text-sm font-medium text-slate-700 py-2">Join Free</Link>
              <Link href="/login" className="block text-sm font-medium text-rose-600 py-2">Sign In</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
