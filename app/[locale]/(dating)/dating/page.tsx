import { Link } from "@/navigation";
import { Shield, Heart, Lock, Users, CheckCircle2, Star } from "lucide-react";

export const metadata = { title: "TrustNest Hearts – Find Love After Divorce" };

export default function DatingLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Verified Divorced Users Only
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Your Second Chapter
            <span className="block bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            A safe, private dating platform exclusively for divorced individuals in India.
            Every member is verified through their court-issued divorce case number.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dating/register"
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-rose-200"
            >
              Start Your Journey — Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-rose-200 text-rose-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              I Already Have an Account
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-6">
            No fake profiles. Every member verified by Indian Court case records.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-rose-600">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { icon: Shield, label: "Court Verified", sub: "Every member" },
            { icon: Lock, label: "100% Private", sub: "Data never shared" },
            { icon: Users, label: "Divorced Only", sub: "Safe community" },
            { icon: Star, label: "Trusted Platform", sub: "TrustNest certified" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="w-7 h-7 opacity-90" />
              <p className="font-bold text-sm">{label}</p>
              <p className="text-xs text-rose-200">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">How It Works</h2>
          <p className="text-center text-slate-500 mb-14">Simple, safe, and dignified</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register & Verify",
                desc: "Create your account and enter your Indian court divorce case number (mutual or contested). Our team verifies it within 24-48 hours.",
                color: "rose",
              },
              {
                step: "02",
                title: "Build Your Profile",
                desc: "Add photos, write your bio, set your preferences. Only verified members can view profiles — keeping the community genuine.",
                color: "pink",
              },
              {
                step: "03",
                title: "Connect & Chat",
                desc: "Like profiles you're interested in. When both parties like each other, it's a match! Start a private conversation and take it from there.",
                color: "fuchsia",
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-100 flex items-center justify-center mb-4`}>
                  <span className={`text-${color}-600 font-black text-lg`}>{step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-14">
            Why TrustNest Hearts?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Real Verification, Zero Fakes",
                desc: "We verify every user's divorce case number against Indian court records. No catfish, no pretenders.",
              },
              {
                title: "Privacy First",
                desc: "Your last name and contact details are never shown publicly. You decide what to share and when.",
              },
              {
                title: "Understanding Community",
                desc: "Everyone here has been through a divorce. There's no judgment — only empathy, shared experience, and hope.",
              },
              {
                title: "Serious Connections",
                desc: "We're not about casual swiping. Our members are looking for meaningful relationships — friendship, companionship, or a second marriage.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-rose-500 to-pink-600">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready to Find Your Person?
        </h2>
        <p className="text-rose-100 mb-8 text-lg">
          Join thousands of verified divorced individuals across India.
        </p>
        <Link
          href="/dating/register"
          className="inline-block bg-white text-rose-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-rose-50 transition-colors shadow-xl"
        >
          Create Free Account
        </Link>
      </section>

      <footer className="bg-slate-900 text-slate-400 text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} TrustNest Hearts · Privacy Policy · Terms of Service</p>
        <p className="mt-1 text-xs">For divorced individuals only. Powered by TrustNest.</p>
      </footer>
    </div>
  );
}
