import Link from "next/link";
import { Atom, Calculator, Bot, LayoutDashboard, FlaskConical, Home } from "lucide-react";

const NAV_LINKS = [
  { href: "/chemverse", label: "Home", icon: Home },
  { href: "/chemverse/periodic-table", label: "Periodic Table", icon: Atom },
  { href: "/chemverse/tools", label: "Tools", icon: Calculator },
  { href: "/chemverse/tutor", label: "AI Tutor", icon: Bot },
  { href: "/chemverse/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function ChemVerseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center h-14 gap-4">
          <Link href="/chemverse" className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white text-sm">Chem<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Verse</span></span>
          </Link>

          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap">
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">
            ← TrustNest
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
