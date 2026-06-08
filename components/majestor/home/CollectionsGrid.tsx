import Link from "next/link";
import { COLLECTIONS } from "@/lib/majestor/products";

const FEATURED_COLLECTIONS = COLLECTIONS.slice(0, 6);

export default function CollectionsGrid() {
  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest mb-1">Browse by Category</p>
          <h2 className="text-2xl font-black text-white">Shop Collections</h2>
        </div>
        <Link href="/majestor/shop" className="text-sm text-slate-400 hover:text-[#00e5a0] transition-colors font-medium">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FEATURED_COLLECTIONS.map(col => (
          <Link key={col.slug} href={`/majestor/collections/${col.slug}`}
            className="group flex flex-col items-center gap-3 p-5 bg-[#0d1117] border border-white/8 rounded-2xl hover:border-[#00e5a0]/40 hover:bg-[#00e5a0]/5 transition-all text-center">
            <span className="text-3xl group-hover:scale-110 transition-transform">{col.icon}</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight">{col.name}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{col.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
