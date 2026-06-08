"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="py-14 px-4">
      <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-[#00e5a0]/10 to-[#00bfff]/5 border border-[#00e5a0]/20 rounded-3xl p-10">
        <div className="w-12 h-12 bg-[#00e5a0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-[#00e5a0]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Stay in the Loop</h2>
        <p className="text-slate-400 text-sm mb-6">
          Get early access to new products, restocks, and exclusive deals. No spam, ever.
        </p>

        {submitted ? (
          <div className="py-3 text-[#00e5a0] font-bold text-sm flex items-center justify-center gap-2">
            ✓ You're subscribed! Welcome to the maker community.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="flex-1 bg-white/5 border border-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00e5a0]/50 placeholder-slate-500 transition-colors"
            />
            <button type="submit"
              className="flex items-center gap-1.5 px-5 py-3 bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] font-black rounded-xl text-sm transition-colors shrink-0">
              Join <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
