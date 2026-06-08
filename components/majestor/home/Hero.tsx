import Link from "next/link";
import { ArrowRight, Zap, Cpu, Wifi } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0c10] py-20 px-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(0,229,160,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00e5a0]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/20 text-[#00e5a0] text-xs font-bold mb-6">
          <Zap className="w-3.5 h-3.5" />
          India's DIY Electronics Store
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
          Your Source for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5a0] to-[#00bfff]">
            High-Quality
          </span>
          <br />DIY Electronics
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          ESP32, Arduino, sensors, displays and 600+ components — delivered across India.
          Build your next IoT project with confidence.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-14">
          <Link href="/majestor/shop"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] font-black text-sm transition-colors">
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/majestor/collections/esp-modules"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-colors">
            <Wifi className="w-4 h-4" /> ESP Modules
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Cpu, label: "Products", value: "644+" },
            { icon: Zap, label: "Orders Shipped", value: "10K+" },
            { icon: Wifi, label: "Cities Served", value: "500+" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <s.icon className="w-4 h-4 text-[#00e5a0]" />
                <span className="text-2xl font-black text-white">{s.value}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
