"use client";

import { useRef } from "react";
import {
  Printer, Download, CheckCircle2, Users, QrCode, FileText,
  Wifi, Shield, Smartphone, BarChart3, Clock, Star, Phone,
  Mail, MapPin, Zap, Activity, Leaf,
} from "lucide-react";

const TODAY = new Date().toLocaleDateString("en-IN", {
  day: "2-digit", month: "long", year: "numeric",
});

/* ── Print helpers ──────────────────────────────────────────────────────────── */
function PrintButton() {
  return (
    <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg text-sm transition-colors"
      >
        <Printer className="w-4 h-4" /> Print / Save PDF
      </button>
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────────── */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mb-12 ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">{label}</p>
      <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
      {sub && <p className="text-slate-500 mt-1 text-sm">{sub}</p>}
    </div>
  );
}

/* ── Feature pill ───────────────────────────────────────────────────────────── */
function Feature({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3 h-3 text-green-600" />
      </div>
      <p className="text-sm text-slate-700 leading-snug">{text}</p>
    </div>
  );
}

/* ── Pricing card ───────────────────────────────────────────────────────────── */
function PriceCard({
  name, price, period, highlight, features, badge,
}: {
  name: string; price: string; period: string;
  highlight?: boolean; features: string[]; badge?: string;
}) {
  return (
    <div className={`rounded-2xl border-2 p-6 flex flex-col ${
      highlight
        ? "border-green-500 bg-green-50"
        : "border-slate-200 bg-white"
    }`}>
      {badge && (
        <span className="self-start text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full mb-3">
          {badge}
        </span>
      )}
      <h3 className="font-extrabold text-slate-800 text-lg mb-1">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-black text-slate-900">{price}</span>
        <span className="text-slate-500 text-sm ml-1">/{period}</span>
      </div>
      <ul className="space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Timeline step ──────────────────────────────────────────────────────────── */
function TimelineStep({ week, title, tasks }: { week: string; title: string; tasks: string[] }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
          {week}
        </div>
        <div className="w-0.5 bg-green-200 flex-1 mt-2" />
      </div>
      <div className="pb-8 flex-1">
        <p className="font-bold text-slate-800 mb-2">{title}</p>
        <ul className="space-y-1">
          {tasks.map((t, i) => (
            <li key={i} className="text-sm text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-400 rounded-full" />{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Main document ──────────────────────────────────────────────────────────── */
export default function ProposalClient() {
  const docRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 18mm 16mm; size: A4; }
          .page-break { break-after: page; }
          .avoid-break { break-inside: avoid; }
        }
        @media screen {
          body { background: #f1f5f9; }
        }
      `}</style>

      <PrintButton />

      <div ref={docRef} className="max-w-4xl mx-auto px-4 py-10 print:px-0 print:py-0 print:max-w-none">

        {/* ── Cover page ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-green-800 rounded-3xl print:rounded-none p-12 mb-10 page-break text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {[80,160,240,320].map(s => (
              <div key={s} className="absolute border border-white rounded-full"
                style={{ width: s, height: s, top: "50%", left: "60%", transform: "translate(-50%,-50%)" }} />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-green-300" />
              </div>
              <div>
                <p className="text-white font-black text-xl leading-none">TrustNest</p>
                <p className="text-green-300 text-xs font-semibold">Smart Digital Solutions</p>
              </div>
            </div>

            <p className="text-green-300 text-sm font-bold uppercase tracking-widest mb-3">
              Business Proposal
            </p>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              Digital Transformation<br />
              <span className="text-green-300">for Your Business</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed mb-10">
              Complete digital management platform for Herbalife Nutrition Clubs
              and Smart Space Intelligence — powered by AI and open-source technology.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { v: "100%", l: "Cloud-Based" },
                { v: "GST", l: "Compliant Billing" },
                { v: "No Camera", l: "Privacy First" },
                { v: "5 Min", l: "Setup Time" },
              ].map(({ v, l }) => (
                <div key={l} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur">
                  <p className="text-xl font-black text-white">{v}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-300 text-sm">Prepared by</p>
                <p className="text-white font-bold">TrustNest Team</p>
              </div>
              <div className="text-right sm:text-right">
                <p className="text-slate-300 text-sm">Date</p>
                <p className="text-white font-bold">{TODAY}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl print:rounded-none shadow-sm print:shadow-none p-8 sm:p-12 space-y-2">

          {/* ── 1. Executive Summary ──────────────────────────────────────────── */}
          <Section id="summary" className="page-break avoid-break">
            <SectionTitle
              label="01 — Overview"
              title="Executive Summary"
              sub="What TrustNest delivers for your business"
            />
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>TrustNest</strong> is a complete, cloud-based digital management platform built specifically
                for Herbalife Nutrition Clubs and modern smart spaces. It replaces paper registers,
                manual tracking, and disconnected tools with a single, mobile-friendly system that works
                on any device — including your smartphone.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform combines <strong>HBL Club Management</strong> (member registration, OTP-based login,
                check-ins, orders, invoicing, QR codes) with <strong>WiFi Body Posture Detection</strong>
                powered by the open-source RuView project — enabling non-invasive, camera-free room
                intelligence using affordable ESP32 hardware.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Every invoice includes your <strong>FSSAI registration number, GSTIN, and proprietor name</strong>
                — fully compliant with Indian food safety and tax regulations. Multi-branch support means
                you can manage all your locations from a single admin dashboard.
              </p>
            </div>
          </Section>

          {/* ── 2. Problem Statement ─────────────────────────────────────────── */}
          <Section className="avoid-break">
            <SectionTitle
              label="02 — The Challenge"
              title="Problems We Solve"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "📋", title: "Manual Paper Registers", desc: "Member attendance, orders, and payments tracked in physical notebooks — error-prone, hard to audit, impossible to analyse." },
                { icon: "📵", title: "No Digital Member Portal", desc: "Members have no self-service access to check their visit history, place orders, or download invoices." },
                { icon: "🧾", title: "Non-Compliant Billing", desc: "Handwritten receipts without FSSAI number or GSTIN expose clubs to compliance risk during inspections." },
                { icon: "📍", title: "No Branch QR System", desc: "Members must remember URLs or ask staff — no quick-scan way to reach the portal for their specific branch." },
                { icon: "👁️", title: "Camera Privacy Concerns", desc: "Traditional occupancy monitoring uses CCTV. Members and staff are uncomfortable with constant video surveillance." },
                { icon: "📊", title: "Zero Business Insights", desc: "No data on peak hours, popular products, member retention, or revenue trends — decisions made without information." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 3. Solution A — HBL ──────────────────────────────────────────── */}
          <Section className="page-break avoid-break">
            <SectionTitle
              label="03 — Solution A"
              title="TrustNest HBL — Nutrition Club Management"
              sub="Everything your club needs in one platform"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              {/* Member Portal */}
              <div className="border border-slate-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="font-bold text-slate-800">Member Portal</p>
                </div>
                <div className="space-y-2.5">
                  <Feature icon={Smartphone} text="OTP-based mobile login — no password to remember" />
                  <Feature icon={QrCode} text="Personal QR code for quick check-in at the counter" />
                  <Feature icon={FileText} text="Full order history and downloadable GST invoices" />
                  <Feature icon={BarChart3} text="Visit streak, check-in calendar and progress tracking" />
                  <Feature icon={Download} text="Download club brochure directly from the app" />
                </div>
              </div>

              {/* Admin Dashboard */}
              <div className="border border-slate-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="font-bold text-slate-800">Admin Dashboard</p>
                </div>
                <div className="space-y-2.5">
                  <Feature icon={Users} text="Add / manage members with photo, plan, and join date" />
                  <Feature icon={BarChart3} text="Daily revenue, order reports, and member analytics" />
                  <Feature icon={QrCode} text="Print-ready QR poster for each branch (member & admin)" />
                  <Feature icon={FileText} text="FSSAI + GSTIN invoice generation per branch" />
                  <Feature icon={Shield} text="PIN-protected admin login with branch deep-link QR" />
                </div>
              </div>
            </div>

            {/* Invoice compliance callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 avoid-break">
              <FileText className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 mb-1">FSSAI & GST Compliant Invoices</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Every invoice automatically includes your <strong>FSSAI licence number</strong>,
                  <strong> GSTIN</strong>, proprietor/FBO name, branch address, and contact.
                  No more handwritten receipts — members receive professional PDF invoices for every order.
                </p>
              </div>
            </div>
          </Section>

          {/* ── 4. Solution B — WiFi Posture ─────────────────────────────────── */}
          <Section className="avoid-break">
            <SectionTitle
              label="04 — Solution B"
              title="WiFi Body Posture Detection"
              sub="Know who is in your space — no cameras, no wearables"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Wifi, title: "No Camera Needed", desc: "Uses standard WiFi signals to detect people — completely privacy-preserving.", color: "bg-cyan-50 border-cyan-100" },
                { icon: Activity, title: "Real-Time Posture", desc: "Detects Standing, Sitting, Lying, Walking — updates live as people move.", color: "bg-violet-50 border-violet-100" },
                { icon: Users, title: "People Count", desc: "Tracks how many people are in the room at any moment — up to 5 simultaneously.", color: "bg-emerald-50 border-emerald-100" },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className={`rounded-xl border p-4 ${color}`}>
                  <Icon className="w-5 h-5 text-slate-600 mb-2" />
                  <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">Powered by RuView</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  Built on the open-source <strong className="text-white">RuView</strong> project (MIT licence) —
                  the viral WiFi DensePose engine that uses $8 ESP32-S3 microcontrollers and Rust-based
                  AI to detect body posture at 54,000 signal frames per second.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["ESP32-S3 Hardware", "Rust Engine", "MIT Licence", "On-Device AI"].map(t => (
                    <span key={t} className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="border border-slate-100 rounded-2xl p-5">
                <p className="font-bold text-slate-800 mb-3">Also works on iPhone</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  Clients with <strong>iPhone 12 Pro or later</strong> can use the built-in
                  camera mode powered by TensorFlow.js MoveNet — 17 body keypoints detected
                  in real time, entirely on-device, no server required.
                </p>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-semibold">iPhone 15 compatible · On-device AI</span>
                </div>
              </div>
            </div>
          </Section>

          {/* ── 5. Technical Highlights ──────────────────────────────────────── */}
          <Section className="avoid-break page-break">
            <SectionTitle
              label="05 — Technical"
              title="Platform Architecture"
              sub="Built for reliability, scale, and security"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { title: "Frontend", items: ["Next.js 14", "React 18", "Tailwind CSS", "Framer Motion"] },
                { title: "Backend", items: ["Next.js API Routes", "Prisma ORM", "PostgreSQL", "NextAuth"] },
                { title: "AI / Sensing", items: ["TensorFlow.js", "MoveNet MultiPose", "RuView (Rust)", "ESP32-S3 CSI"] },
                { title: "Integrations", items: ["Fast2SMS OTP", "Cloudinary CDN", "AWS S3", "Vercel Deploy"] },
              ].map(({ title, items }) => (
                <div key={title} className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{title}</p>
                  <ul className="space-y-1">
                    {items.map(item => (
                      <li key={item} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-green-400 rounded-full" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: "Multi-Tenant SaaS", desc: "Each branch gets its own isolated data, admin PIN, QR code, and invoice identity. One deployment, many clients." },
                { icon: Zap, title: "Instant Deployment", desc: "Hosted on Vercel CDN. Goes live in minutes. No servers to manage, no IT team needed." },
                { icon: Clock, title: "99.9% Uptime", desc: "Serverless architecture with auto-scaling. Members can log in and order 24/7 without downtime." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-50 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-green-600 mb-2" />
                  <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 6. Use Cases ─────────────────────────────────────────────────── */}
          <Section className="avoid-break">
            <SectionTitle
              label="06 — Who Is It For"
              title="Ideal Client Profiles"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🌿", title: "Herbalife Nutrition Club Owners", tags: ["Member management", "OTP login", "QR codes", "GST invoices", "Multi-branch"], desc: "Single and multi-branch HBL club owners who need a complete digital system to replace paper registers and provide professional member experience." },
                { icon: "🏋️", title: "Fitness Centres & Gyms", tags: ["Check-in tracking", "Occupancy", "Posture analytics", "Member portal"], desc: "Gyms wanting smart occupancy monitoring, member attendance, and posture-aware training without intrusive cameras." },
                { icon: "🏢", title: "Corporate Wellness Programmes", tags: ["Room sensing", "People count", "WiFi posture", "Privacy-first"], desc: "Offices deploying ergonomic monitoring in meeting rooms and workspaces — detect prolonged sitting and alert employees." },
                { icon: "🏥", title: "Physiotherapy & Rehab Clinics", tags: ["Posture detection", "Progress tracking", "Patient records", "Appointment history"], desc: "Clinics tracking patient posture improvement over sessions without video recording — WiFi CSI provides objective, privacy-safe data." },
              ].map(({ icon, title, tags, desc }) => (
                <div key={title} className="border border-slate-200 rounded-2xl p-5 avoid-break">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{icon}</span>
                    <p className="font-bold text-slate-800 text-sm leading-snug">{title}</p>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => (
                      <span key={t} className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 7. Pricing ───────────────────────────────────────────────────── */}
          <Section className="page-break avoid-break">
            <SectionTitle
              label="07 — Investment"
              title="Pricing Packages"
              sub="Transparent, no hidden charges"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              <PriceCard
                name="Starter"
                price="₹999"
                period="month"
                features={[
                  "1 branch / location",
                  "Up to 100 members",
                  "OTP mobile login",
                  "Order & billing management",
                  "GST + FSSAI invoices",
                  "Branch QR code poster",
                  "Email support",
                ]}
              />
              <PriceCard
                name="Professional"
                price="₹2,499"
                period="month"
                highlight
                badge="Most Popular"
                features={[
                  "Up to 5 branches",
                  "Unlimited members",
                  "All Starter features",
                  "WhatsApp OTP delivery",
                  "Revenue analytics dashboard",
                  "Member retention reports",
                  "Priority support",
                ]}
              />
              <PriceCard
                name="Enterprise"
                price="Custom"
                period="quote"
                features={[
                  "Unlimited branches",
                  "WiFi Posture Detection add-on",
                  "ESP32 hardware setup support",
                  "White-label branding",
                  "Custom integrations / API",
                  "On-site training",
                  "Dedicated account manager",
                ]}
              />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-500 text-center">
              All plans include a <strong className="text-slate-700">14-day free trial</strong>. No credit card required to start.
              Setup fee waived for first 3 months on annual billing.
            </div>
          </Section>

          {/* ── 8. Timeline ──────────────────────────────────────────────────── */}
          <Section className="avoid-break">
            <SectionTitle
              label="08 — Onboarding"
              title="Implementation Timeline"
              sub="From sign-up to fully operational in under 2 weeks"
            />
            <div className="max-w-lg">
              <TimelineStep week="W1" title="Account Setup & Configuration"
                tasks={["Create tenant account for your branch", "Configure FSSAI, GSTIN, address, admin PIN", "Upload branch branding and products"]} />
              <TimelineStep week="W2" title="Member Data Migration"
                tasks={["Import existing member list (Excel/CSV supported)", "Register member mobile numbers for OTP login", "Print and deploy branch QR code posters"]} />
              <TimelineStep week="W3" title="Staff Training"
                tasks={["Admin dashboard walkthrough (1 hour session)", "Scanner / check-in station setup", "Invoice and order flow demonstration"]} />
              <TimelineStep week="W4" title="Go Live"
                tasks={["Members start using the portal", "Monitor daily via admin reports", "WhatsApp/email support available"]} />
            </div>
          </Section>

          {/* ── 9. Why TrustNest ─────────────────────────────────────────────── */}
          <Section className="avoid-break page-break">
            <SectionTitle
              label="09 — Why Us"
              title="Why Choose TrustNest"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Star, title: "Built for Indian Nutrition Clubs", desc: "Designed specifically for HBL clubs in India — FSSAI compliance, Indian phone number OTP, ₹ billing, Tamil/multilingual ready." },
                { icon: Shield, title: "Privacy-First Architecture", desc: "No video storage, no biometrics. Member data stays in your database. WiFi posture detection uses only signal metadata — no images ever." },
                { icon: Zap, title: "Affordable & Scalable", desc: "Start at ₹999/month. As your club grows from 1 to 10 branches, the platform grows with you — same dashboard, no migration needed." },
                { icon: CheckCircle2, title: "Open-Source Core", desc: "WiFi sensing is powered by MIT-licensed open-source software (RuView). No vendor lock-in for the AI layer — you own your sensing data." },
                { icon: Clock, title: "Zero IT Overhead", desc: "Fully managed cloud hosting. No servers, no backups, no updates to manage. We handle the infrastructure; you run your business." },
                { icon: Activity, title: "Proven Technology Stack", desc: "Built on Next.js, PostgreSQL, and TensorFlow.js — the same stack used by Fortune 500 companies. Battle-tested, reliable, and fast." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 10. Testimonial / Social Proof ───────────────────────────────── */}
          <Section className="avoid-break">
            <div className="bg-green-600 rounded-2xl p-8 text-white text-center">
              <p className="text-3xl mb-4">🌿</p>
              <p className="text-xl font-bold italic mb-4 leading-relaxed max-w-xl mx-auto">
                "Managing 80+ members used to take 2 hours of paperwork daily.
                With TrustNest, it's all automated — members scan in, orders are tracked,
                and invoices generate automatically."
              </p>
              <p className="text-green-200 font-semibold">S K C Yoganathan</p>
              <p className="text-green-300 text-sm">Proprietor, Veppampattu Herbalife Nutrition Club</p>
            </div>
          </Section>

          {/* ── 11. Next Steps / Contact ──────────────────────────────────────── */}
          <Section className="avoid-break">
            <SectionTitle
              label="10 — Let's Begin"
              title="Next Steps"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { num: "01", title: "Schedule a Demo", desc: "Book a 30-minute live walkthrough of the full platform — no commitment required." },
                { num: "02", title: "Start Free Trial", desc: "We set up your account in 1 hour. 14-day free trial with all Professional features." },
                { num: "03", title: "Go Live", desc: "Your branch is live with member portal, QR codes, and digital billing within the week." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="border border-slate-100 rounded-2xl p-5 text-center">
                  <p className="text-4xl font-black text-green-100 mb-2">{num}</p>
                  <p className="font-bold text-slate-800 mb-2">{title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Contact block */}
            <div className="bg-slate-800 rounded-2xl p-8 text-white">
              <p className="text-lg font-extrabold mb-6 text-center">Get in Touch</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-slate-400">Phone / WhatsApp</p>
                  <p className="font-bold text-white">+91 XXXXX XXXXX</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-bold text-white">hello@trustnest.in</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-violet-400" />
                  </div>
                  <p className="text-xs text-slate-400">Live Demo</p>
                  <p className="font-bold text-white">trustnest-tsgz.vercel.app</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-green-500" />
              <span className="font-bold text-green-700">TrustNest</span>
              <span>— Smart Digital Solutions</span>
            </div>
            <p>Confidential · {new Date().getFullYear()} · All rights reserved</p>
          </div>

        </div>
      </div>
    </>
  );
}
