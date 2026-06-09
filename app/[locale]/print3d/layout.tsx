import Link from "next/link";
import { Printer, Images, ShoppingCart, Box } from "lucide-react";

const NAV_LINKS = [
  { href: "/print3d", label: "Home", icon: Printer },
  { href: "/print3d/gallery", label: "Gallery", icon: Images },
  { href: "/print3d/cad", label: "CAD Designer", icon: Box },
  { href: "/print3d/order", label: "Order Now", icon: ShoppingCart },
];

export default function Print3DLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060912" }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          background: "rgba(6,9,18,0.85)",
          borderColor: "rgba(249,115,22,0.15)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 flex items-center h-14 gap-4">
          <Link href="/print3d" className="flex items-center gap-2 mr-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f97316,#ea6e0f)" }}
            >
              <Printer className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-white text-sm">
              Print<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#f97316,#22d3ee)" }}>3D</span>
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                style={{ color: "#94a3b8" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "white";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="text-xs transition-colors whitespace-nowrap"
            style={{ color: "#64748b" }}
          >
            ← TrustNest
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
