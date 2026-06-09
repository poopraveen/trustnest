import Link from "next/link";
import { Printer, Box, Images, ShoppingCart, Layers } from "lucide-react";

export default function Print3DHome() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg,#f97316,#ea6e0f)" }}
        >
          <Printer className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">
          Print<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#f97316,#22d3ee)" }}>3D</span> Studio
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Design, visualize, and order custom 3D-printed parts — all in your browser.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/print3d/cad", icon: Box, title: "CAD Designer", desc: "Parametric modeler + STL viewer", color: "#f97316" },
            { href: "/print3d/gallery", icon: Images, title: "Gallery", desc: "Browse community prints", color: "#22d3ee" },
            { href: "/print3d/order", icon: ShoppingCart, title: "Order Now", desc: "Upload STL & place order", color: "#a78bfa" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl p-6 flex flex-col items-center gap-3 transition-all hover:scale-105"
              style={{
                background: "#0d1220",
                border: "1px solid rgba(249,115,22,0.15)",
              }}
            >
              <item.icon className="w-8 h-8" style={{ color: item.color }} />
              <div className="text-white font-bold">{item.title}</div>
              <div className="text-slate-400 text-sm text-center">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16 flex items-center gap-2 text-slate-600 text-sm">
        <Layers className="w-4 h-4" />
        <span>Powered by Three.js + JSCAD — runs entirely in your browser</span>
      </div>
    </div>
  );
}
