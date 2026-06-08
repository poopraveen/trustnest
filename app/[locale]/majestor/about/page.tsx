import type { Metadata } from "next";
import { Zap, Package, Truck, HeartHandshake } from "lucide-react";

export const metadata: Metadata = { title: "About | Majestronicz" };

const VALUES = [
  { icon: Zap, title: "Quality First", desc: "Every component tested and sourced from verified manufacturers. No compromises." },
  { icon: Package, title: "Fast Shipping", desc: "Orders dispatched within 24 hours. Pan-India delivery via trusted couriers." },
  { icon: Truck, title: "Free Delivery", desc: "Free shipping on TN prepaid orders above ₹999. Expanding nationwide soon." },
  { icon: HeartHandshake, title: "Maker Community", desc: "Supporting India's DIY maker revolution one project at a time since 2020." },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest mb-2">Our Story</p>
        <h1 className="text-4xl font-black text-white mb-4">About Majestronicz</h1>
        <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
          Born in Tamil Nadu, built for India's makers. We started Majestronicz to solve a simple problem:
          getting quality electronics components without the hassle of long waits or inflated prices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {VALUES.map(v => (
          <div key={v.title} className="bg-[#0d1117] border border-white/8 rounded-2xl p-6">
            <div className="w-10 h-10 bg-[#00e5a0]/10 rounded-xl flex items-center justify-center mb-4">
              <v.icon className="w-5 h-5 text-[#00e5a0]" />
            </div>
            <h3 className="text-white font-bold mb-2">{v.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#00e5a0]/10 to-[#00bfff]/5 border border-[#00e5a0]/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-black text-white mb-3">644+ Products, 10K+ Orders</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          From ESP modules to sensors, we stock what Indian makers actually need.
          Next-day shipping within TN. Fast delivery Pan-India.
        </p>
      </div>
    </div>
  );
}
