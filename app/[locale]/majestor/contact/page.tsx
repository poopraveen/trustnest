"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-[#00e5a0] text-xs font-bold uppercase tracking-widest mb-2">Get in Touch</p>
        <h1 className="text-4xl font-black text-white mb-3">Contact Us</h1>
        <p className="text-slate-400">Questions about a product or order? We reply within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {[
            { icon: Mail, label: "Email", value: "support@majestronicz.in" },
            { icon: Phone, label: "WhatsApp", value: "+91 98765 43210" },
            { icon: MapPin, label: "Location", value: "Chennai, Tamil Nadu, India" },
          ].map(c => (
            <div key={c.label} className="flex items-start gap-4 p-4 bg-[#0d1117] border border-white/8 rounded-xl">
              <div className="w-9 h-9 bg-[#00e5a0]/10 rounded-lg flex items-center justify-center shrink-0">
                <c.icon className="w-4 h-4 text-[#00e5a0]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{c.label}</p>
                <p className="text-white text-sm font-semibold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 bg-[#0d1117] border border-white/8 rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-[#00e5a0]/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-[#00e5a0]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Message Sent!</h3>
              <p className="text-slate-400 text-sm">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name", label: "Your Name", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email Address", type: "email", placeholder: "you@email.com" },
                { key: "subject", label: "Subject", type: "text", placeholder: "Order issue, product query…" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00e5a0]/40 placeholder-slate-600 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Message</label>
                <textarea rows={4} required placeholder="Tell us how we can help…"
                  value={form.message}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00e5a0]/40 placeholder-slate-600 transition-colors resize-none"
                />
              </div>
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#00e5a0] hover:bg-[#00cc8e] text-[#0a0c10] rounded-xl font-black text-sm transition-colors">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
