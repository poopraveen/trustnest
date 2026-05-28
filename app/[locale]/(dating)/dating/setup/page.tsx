"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User, MapPin, BookOpen, Briefcase, Heart, Loader2,
  ChevronRight, ChevronLeft, CheckCircle2,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry",
];

const RELIGIONS = ["Hindu","Muslim","Christian","Sikh","Buddhist","Jain","Jewish","Parsi","No Religion","Other"];
const EDUCATION_OPTS = ["Below 10th","10th Pass","12th Pass","Diploma","Graduate","Post Graduate","PhD","Other"];
const INCOME_RANGES = ["Below ₹3L","₹3L–₹5L","₹5L–₹10L","₹10L–₹20L","₹20L–₹50L","Above ₹50L","Prefer not to say"];

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    displayName: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    bio: "",
    height: "",
    religion: "",
    motherTongue: "",
    education: "",
    occupation: "",
    incomeRange: "",
    hasChildren: false,
    wantsChildren: "",
    goals: "SERIOUS_RELATIONSHIP",
    lookingForGender: "",
    minAge: "28",
    maxAge: "50",
  });

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;

    fetch("/api/dating/profile").then((r) => r.json()).then((d) => {
      if (d.verification?.status !== "VERIFIED") {
        router.push("/dating/pending");
        return;
      }
      if (d.profile) {
        const p = d.profile;
        setForm((f) => ({
          ...f,
          displayName: p.displayName ?? "",
          age: String(p.age ?? ""),
          gender: p.gender ?? "",
          city: p.city ?? "",
          state: p.state ?? "",
          bio: p.bio ?? "",
          height: p.height ? String(p.height) : "",
          religion: p.religion ?? "",
          motherTongue: p.motherTongue ?? "",
          education: p.education ?? "",
          occupation: p.occupation ?? "",
          incomeRange: p.incomeRange ?? "",
          hasChildren: p.hasChildren ?? false,
          wantsChildren: p.wantsChildren === null ? "" : String(p.wantsChildren),
          goals: p.goals ?? "SERIOUS_RELATIONSHIP",
          lookingForGender: p.lookingForGender ?? "",
          minAge: p.minAge ? String(p.minAge) : "28",
          maxAge: p.maxAge ? String(p.maxAge) : "50",
        }));
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [status, router]);

  const upd = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.displayName.trim()) { toast("Enter your display name", "error"); return false; }
      if (!form.age || parseInt(form.age) < 18 || parseInt(form.age) > 100) { toast("Enter a valid age (18–100)", "error"); return false; }
      if (!form.gender) { toast("Select your gender", "error"); return false; }
      if (!form.city.trim()) { toast("Enter your city", "error"); return false; }
      if (!form.state) { toast("Select your state", "error"); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dating/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          wantsChildren: form.wantsChildren === "" ? null : form.wantsChildren === "true",
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Save failed", "error"); return; }
      toast("Profile saved!", "success");
      router.push("/dating/profiles");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  if (checking || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Member
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Tell potential matches about yourself</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                step > s ? "bg-rose-500 text-white" : step === s ? "bg-rose-500 text-white ring-4 ring-rose-200" : "bg-slate-200 text-slate-500"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < totalSteps && <div className={`w-10 h-0.5 ${step > s ? "bg-rose-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-rose-500" /> Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => upd("displayName", e.target.value)}
                    placeholder="How you want to appear"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => upd("age", e.target.value)}
                    placeholder="Your age"
                    min="18"
                    max="100"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => upd("height", e.target.value)}
                    placeholder="e.g., 170"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => upd("gender", g.value)}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.gender === g.value ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => upd("city", e.target.value)}
                      placeholder="Your city"
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => upd("state", e.target.value)}
                    className="input-base"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">About Me</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => upd("bio", e.target.value)}
                  placeholder="Tell others a little about yourself, your interests, and what you're looking for..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-rose-500" /> Background
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Religion</label>
                  <select value={form.religion} onChange={(e) => upd("religion", e.target.value)} className="input-base">
                    <option value="">Select</option>
                    {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mother Tongue</label>
                  <input
                    type="text"
                    value={form.motherTongue}
                    onChange={(e) => upd("motherTongue", e.target.value)}
                    placeholder="e.g., Tamil, Hindi"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Highest Education</label>
                <select value={form.education} onChange={(e) => upd("education", e.target.value)} className="input-base">
                  <option value="">Select</option>
                  {EDUCATION_OPTS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(e) => upd("occupation", e.target.value)}
                    placeholder="e.g., Software Engineer, Doctor"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Annual Income (Optional)</label>
                <select value={form.incomeRange} onChange={(e) => upd("incomeRange", e.target.value)} className="input-base">
                  <option value="">Prefer not to say</option>
                  {INCOME_RANGES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Do you have children?</label>
                <div className="flex gap-3">
                  {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(({ v, l }) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => upd("hasChildren", v)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.hasChildren === v ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-rose-500" /> What I&apos;m Looking For
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Relationship Goal</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { v: "FRIENDSHIP", l: "Friendship", d: "Looking for companionship and friendship" },
                    { v: "CASUAL_DATING", l: "Casual Dating", d: "Open to casual connections" },
                    { v: "SERIOUS_RELATIONSHIP", l: "Serious Relationship", d: "Looking for a committed partner" },
                    { v: "MARRIAGE", l: "Marriage", d: "Seeking a life partner for remarriage" },
                  ].map(({ v, l, d }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => upd("goals", v)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.goals === v ? "border-rose-500 bg-rose-50" : "border-slate-200 hover:border-rose-200"
                      }`}
                    >
                      <p className={`text-sm font-medium ${form.goals === v ? "text-rose-700" : "text-slate-700"}`}>{l}</p>
                      <p className="text-xs text-slate-400">{d}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Looking For</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "MALE", label: "Men" },
                    { value: "FEMALE", label: "Women" },
                    { value: "OTHER", label: "Other" },
                    { value: "", label: "Anyone" },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => upd("lookingForGender", g.value)}
                      className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.lookingForGender === g.value ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Minimum Age</label>
                  <input
                    type="number"
                    value={form.minAge}
                    onChange={(e) => upd("minAge", e.target.value)}
                    min="18"
                    max="80"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Maximum Age</label>
                  <input
                    type="number"
                    value={form.maxAge}
                    onChange={(e) => upd("maxAge", e.target.value)}
                    min="18"
                    max="100"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Open to partner with children?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: "true", l: "Yes" }, { v: "false", l: "No" }, { v: "", l: "Doesn't matter" }].map(({ v, l }) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => upd("wantsChildren", v)}
                      className={`py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                        form.wantsChildren === v ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => { if (validateStep()) setStep((s) => s + 1); }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Saving..." : "Save & Start Discovering"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
