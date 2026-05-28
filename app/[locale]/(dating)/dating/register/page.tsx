"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/navigation";
import { signIn } from "next-auth/react";
import {
  User, Mail, Lock, Phone, Eye, EyeOff, FileText,
  Building2, MapPin, CalendarDays, Loader2, ChevronRight, ChevronLeft, Shield,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface MockECourtsResponse {
  status: "SUCCESS" | "NOT_FOUND" | "INVALID_FORMAT";
  caseRef: string;
  courtName: string;
  state: string;
  currentStatus: string;
  disposalDate: string | null;
  source: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh",
  "Puducherry","Andaman & Nicobar","Lakshadweep","Dadra & Nagar Haveli",
];

const COURT_TYPES = [
  "Family Court",
  "District Court",
  "High Court",
  "Sessions Court",
  "Civil Court",
  "Supreme Court",
];

const CASE_TYPES = [
  { value: "MUTUAL_CONSENT", label: "Mutual Consent Divorce (Sec. 13B HMA)", desc: "Both parties agreed to divorce" },
  { value: "CONTESTED", label: "Contested Divorce (Sec. 13 HMA)", desc: "One party filed for divorce" },
  { value: "ANNULMENT", label: "Annulment", desc: "Marriage declared void/voidable" },
  { value: "JUDICIAL_SEPARATION", label: "Judicial Separation", desc: "Court-ordered separation decree" },
];

export default function DatingRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mockResponse, setMockResponse] = useState<MockECourtsResponse | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<MockECourtsResponse | null>(null);

  const handlePreviewVerification = async () => {
    if (!form.caseType || !form.courtType || !form.courtCity || !form.state || !form.caseNumber || !form.year) {
      toast("Fill in all case details first", "error");
      return;
    }
    setPreviewLoading(true);
    setPreviewResult(null);
    try {
      const res = await fetch("/api/dating/verify-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseType: form.caseType,
          courtType: form.courtType,
          courtCity: form.courtCity,
          state: form.state,
          caseNumber: form.caseNumber,
          year: form.year,
        }),
      });
      const data = await res.json();
      setPreviewResult(data);
    } catch {
      toast("Could not fetch mock response", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    caseType: "",
    courtType: "",
    courtCity: "",
    state: "",
    caseNumber: "",
    year: String(new Date().getFullYear() - 1),
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validateStep1 = () => {
    if (!form.name.trim()) { toast("Please enter your name", "error"); return false; }
    if (!form.email.trim()) { toast("Please enter your email", "error"); return false; }
    if (form.password.length < 8) { toast("Password must be at least 8 characters", "error"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.caseType) { toast("Please select case type", "error"); return false; }
    if (!form.courtType) { toast("Please select court type", "error"); return false; }
    if (!form.courtCity.trim()) { toast("Please enter court city", "error"); return false; }
    if (!form.state) { toast("Please select state", "error"); return false; }
    if (!form.caseNumber.trim()) { toast("Please enter case number", "error"); return false; }
    if (!/^\d{4}$/.test(form.year)) { toast("Please enter a valid 4-digit year", "error"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setMockResponse(null);
    try {
      const res = await fetch("/api/dating/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Registration failed", "error"); return; }

      if (data.verification?.mockECourtsResponse) {
        setMockResponse(data.verification.mockECourtsResponse);
        setVerificationStatus(data.verification.status);
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      // Show the response for 3 seconds then redirect
      setTimeout(() => {
        if (data.verification?.status === "VERIFIED") {
          router.push("/dating/setup");
        } else {
          router.push("/dating/pending");
        }
      }, 3000);
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-rose-200">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 mt-1 text-sm">Verification through Indian court records</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-rose-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-4">Step 1: Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your full name"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="input-base pl-10 pr-10"
                    minLength={8}
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
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity mt-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-1">Step 2: Court Case Verification</h2>
              <p className="text-xs text-slate-500 mb-4">
                Enter your divorce/separation case details as filed in an Indian court. This is used solely for identity verification and will never be shared publicly.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type of Case</label>
                <div className="grid grid-cols-1 gap-2">
                  {CASE_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => update("caseType", ct.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.caseType === ct.value
                          ? "border-rose-500 bg-rose-50"
                          : "border-slate-200 hover:border-rose-200"
                      }`}
                    >
                      <p className={`text-sm font-medium ${form.caseType === ct.value ? "text-rose-700" : "text-slate-700"}`}>
                        {ct.label}
                      </p>
                      <p className="text-xs text-slate-400">{ct.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Court Type</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={form.courtType}
                      onChange={(e) => update("courtType", e.target.value)}
                      className="input-base pl-10 appearance-none"
                    >
                      <option value="">Select court</option>
                      {COURT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      className="input-base pl-10 appearance-none"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Court City / District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.courtCity}
                    onChange={(e) => update("courtCity", e.target.value)}
                    placeholder="e.g., Chennai, Mumbai, Delhi"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.caseNumber}
                      onChange={(e) => update("caseNumber", e.target.value)}
                      placeholder="e.g., 1234/2023"
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Filing Year</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                      placeholder="2023"
                      min="1990"
                      max={new Date().getFullYear()}
                      className="input-base pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <strong>Privacy Notice:</strong> Your case number is used only for verification purposes and is never displayed publicly or shared with other users.
              </div>

              {/* Live eCourts preview */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-slate-500 font-mono">eCourts India API — Mock Preview</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePreviewVerification}
                    disabled={previewLoading}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-md font-mono hover:bg-slate-700 disabled:opacity-60"
                  >
                    {previewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    {previewLoading ? "Fetching..." : "▶ Test Verification"}
                  </button>
                </div>
                <div className="bg-slate-900 p-4 min-h-[80px]">
                  {previewResult ? (
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(previewResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-500 font-mono">
                      {`// Click "Test Verification" to preview the eCourts API mock response`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:border-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </div>
          )}
        </div>

        {mockResponse && (
          <div className={`mt-4 rounded-2xl border-2 p-5 shadow-sm ${
            mockResponse.status === "SUCCESS"
              ? "border-green-300 bg-green-50"
              : "border-red-300 bg-red-50"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {mockResponse.status === "SUCCESS" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-semibold text-sm ${mockResponse.status === "SUCCESS" ? "text-green-800" : "text-red-800"}`}>
                eCourts API Response
              </span>
              <span className="ml-auto text-xs text-slate-400 font-mono">200 OK</span>
            </div>
            <pre className="text-xs bg-white/80 rounded-lg p-3 font-mono text-slate-700 overflow-x-auto border border-slate-200">
{JSON.stringify(mockResponse, null, 2)}
            </pre>
            <div className="flex items-center gap-2 mt-3">
              {verificationStatus === "VERIFIED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Verified! Redirecting to profile setup...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">Pending manual review. Redirecting...</span>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-rose-600 font-medium hover:text-rose-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
