import Link from "next/link";
import { Zap } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "ESP Modules", href: "/majestor/collections/esp-modules" },
    { label: "Arduino", href: "/majestor/collections/arduino" },
    { label: "Sensors", href: "/majestor/collections/sensors" },
    { label: "All Products", href: "/majestor/shop" },
  ],
  Help: [
    { label: "Contact Us", href: "/majestor/contact" },
    { label: "About Us", href: "/majestor/about" },
    { label: "Shipping Policy", href: "#" },
    { label: "Return Policy", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Refund Policy", href: "#" },
  ],
};

export default function MajesFooter() {
  return (
    <footer className="bg-[#0d1117] border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/majestor" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-[#00e5a0] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#0a0c10]" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">MAJESTRONICZ</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Your trusted source for high-quality DIY electronics. Serving makers across India since 2020.
            </p>
            <p className="text-xs text-slate-500">
              CIN: India · GST: 33XXXXX
            </p>
          </div>

          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{title}</p>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#00e5a0] text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">© 2024 Majestronicz. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {["UPI", "Visa", "MC", "RuPay", "Razorpay"].map(pm => (
              <span key={pm} className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                {pm}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
