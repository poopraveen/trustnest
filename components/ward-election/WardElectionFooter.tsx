import { Link } from "@/navigation";
import { Vote } from "lucide-react";

export default function WardElectionFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-indigo-950 text-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Vote className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white">Ward Election</span>
              <span className="text-[11px] text-indigo-300">Ward-Level Insights</span>
            </div>
          </div>
          <p className="text-xs text-indigo-300 max-w-md text-center md:text-right">
            Ward-level election data, candidates, turnout and results — built on verifiable,
            sourced data.
          </p>
        </div>
        <div className="border-t border-indigo-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-indigo-400">© {year} TrustNest · Ward Election</p>
          <Link href="/" className="text-xs text-indigo-300 hover:text-white transition-colors">
            Back to TrustNest
          </Link>
        </div>
      </div>
    </footer>
  );
}
