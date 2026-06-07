"use client";

import { useState, useEffect } from "react";
import { Radio, Wifi, Smartphone, Terminal, Copy, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MeshChatSetupPage() {
  const [copied, setCopied] = useState(false);
  const [localUrl, setLocalUrl] = useState("");

  useEffect(() => {
    setLocalUrl(window.location.origin + "/mesh-chat");
  }, []);

  const qrUrl = localUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(localUrl)}&size=220x220&bgcolor=0f172a&color=22d3ee&qzone=2`
    : "";

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 border-2 border-cyan-500/40 rounded-3xl mb-4">
            <Radio className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black mb-2">Mesh Chat</h1>
          <p className="text-slate-400">Offline-capable · Local WiFi · No Internet Needed</p>
        </div>

        {/* QR + URL */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6 text-center">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
            Share with everyone on your WiFi
          </p>
          {qrUrl && (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" className="w-44 h-44 rounded-xl" />
            </div>
          )}
          <p className="text-slate-400 text-sm mb-2">Scan QR above or share this URL:</p>
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3 border border-slate-700">
            <code className="flex-1 text-cyan-400 text-sm font-mono break-all text-left">{localUrl}</code>
            <button onClick={() => copy(localUrl)}
              className="shrink-0 p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
          <Link href="/mesh-chat"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-sm transition-colors">
            <Radio className="w-4 h-4" /> Open Chat
          </Link>
        </div>

        {/* How to run locally */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold">Run on your laptop (fully offline)</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            For true offline use (no Vercel, no internet) run the server on your own laptop.
            Everyone on the same WiFi hotspot can then chat.
          </p>
          <div className="space-y-3">
            {[
              { step: "1", label: "Windows", cmd: "Double-click scripts/start-mesh-chat.bat", icon: "🪟" },
              { step: "2", label: "Mac / Linux", cmd: "bash scripts/start-mesh-chat.sh", icon: "🍎" },
            ].map(({ step, label, cmd, icon }) => (
              <div key={step} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">{icon} {label}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-cyan-300 text-sm font-mono">{cmd}</code>
                  <button onClick={() => copy(cmd)} className="shrink-0 p-1 rounded hover:bg-slate-700 transition-colors">
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* iPhone steps */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold">How iPhone users join</h2>
          </div>
          <div className="space-y-3">
            {[
              "Connect iPhone to the same WiFi hotspot as the laptop running the server",
              "Open Safari on iPhone",
              "Scan the QR code above or type the URL shown",
              "Enter your name — no password, no account needed",
              "Start chatting! Works even if internet goes down",
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">{i + 1}</div>
                <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature list */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold">What this app does</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "📢 General — everyday coordination",
              "🆘 SOS — emergency alerts (priority banner)",
              "🏥 Medical — medical help requests",
              "🚗 Evacuation — route and transport info",
              "📦 Resources — food, water, supplies",
              "📎 File sharing — photos, PDFs, documents",
              "👥 Online presence — see who is active",
              "✅ Status — Safe / Need Help / Providing Help",
              "💾 Offline queue — messages sent when reconnected",
              "📱 Works on any phone, tablet, or laptop",
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pb-10">
          <a href="https://github.com/poopraveen/trustnest" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Source code on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
