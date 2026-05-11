"use client";

import { useState } from "react";
import { Link } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, Building2, Home } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { brand } from "@/lib/brand";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "SELLER" ? "SELLER" : "BUYER";
  const t = useTranslations("auth");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole as "BUYER" | "SELLER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast(t("passwordMin"), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("registrationFailed"), "error");
        return;
      }
      toast(t("accountCreated"), "success");
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: form.role === "SELLER" ? "/seller/dashboard" : "/",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{t("registerTitle")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{t("registerSubtitle", { brand: brand.name })}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { value: "BUYER" as const, label: t("buyerRole"), icon: Home, desc: t("buyerDesc") },
            { value: "SELLER" as const, label: t("sellerRole"), icon: Building2, desc: t("sellerDesc") },
          ]).map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, role: value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.role === value
                  ? "border-primary-600 bg-primary-50"
                  : "border-slate-200 hover:border-primary-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${form.role === value ? "text-primary-600" : "text-slate-400"}`} />
              <p className={`text-sm font-semibold ${form.role === value ? "text-primary-700" : "text-slate-700"}`}>
                {label}
              </p>
              <p className="text-xs text-slate-400">{desc}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/" }); }}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mb-4 disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {t("continueGoogle")}
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-slate-400">{t("orRegisterEmail")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("name")}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("namePlaceholder")}
                className="input-base pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("email")}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("emailPlaceholder")}
                className="input-base pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("phoneOptional")}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={t("phonePlaceholder")}
                className="input-base pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("password")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("passwordMinPlaceholder")}
                className="input-base pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? t("creating") : t("createAccount")}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          {t("termsIntro")}{" "}
          <Link href="/terms" className="text-primary-600">{t("termsOfServiceLink")}</Link> {t("and")}{" "}
          <Link href="/privacy" className="text-primary-600">{t("privacyPolicyLink")}</Link>
        </p>

        <p className="text-center text-sm text-slate-500 mt-4">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:text-primary-800">
            {t("signInLower")}
          </Link>
        </p>
      </div>
    </div>
  );
}
