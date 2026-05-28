import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import { Clock, CheckCircle2, XCircle, ArrowRight, Shield } from "lucide-react";

export const metadata = { title: "Verification Pending – TrustNest Hearts" };

export default async function PendingVerificationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const verification = await prisma.courtCaseVerification.findUnique({
    where: { userId: session.user.id },
  });

  if (!verification) redirect("/dating/register");

  if (verification.status === "VERIFIED") {
    const profile = await prisma.datingProfile.findUnique({ where: { userId: session.user.id } });
    if (profile?.isComplete) redirect("/dating/profiles");
    redirect("/dating/setup");
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      iconClass: "text-amber-500 bg-amber-100",
      title: "Verification In Progress",
      subtitle: "We're reviewing your divorce case details",
      color: "amber",
    },
    REJECTED: {
      icon: XCircle,
      iconClass: "text-red-500 bg-red-100",
      title: "Verification Unsuccessful",
      subtitle: "We could not verify your case details",
      color: "red",
    },
  };

  const config = statusConfig[verification.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full ${config.iconClass} flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">{config.title}</h1>
          <p className="text-slate-500 mb-8">{config.subtitle}</p>

          {verification.status === "PENDING" && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Case Reference</span>
                  <span className="font-mono font-medium text-slate-800">{verification.fullCaseRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Court</span>
                  <span className="text-slate-800">{verification.courtType}, {verification.courtCity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">State</span>
                  <span className="text-slate-800">{verification.state}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  {[
                    "Our team will verify your case number with Indian court records",
                    "Verification typically takes 24–48 working hours",
                    "You will receive an email once your account is approved",
                    "After approval, you can set up your dating profile",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your privacy is our priority. Case details are encrypted and used only for verification.
                </span>
              </div>
            </div>
          )}

          {verification.status === "REJECTED" && (
            <div className="space-y-4">
              {verification.rejectionNote && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-left">
                  <p className="font-medium mb-1">Reason:</p>
                  <p>{verification.rejectionNote}</p>
                </div>
              )}
              <p className="text-sm text-slate-500">
                Please double-check your case details and contact our support team if you believe this is an error.
              </p>
              <Link
                href="/dating/register"
                className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                Re-apply <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-6 text-sm">
          <Link href="/dating" className="text-slate-500 hover:text-rose-600">← Back to Home</Link>
          {verification.status === "PENDING" && (
            <Link href="/dating/pending" className="text-rose-600 hover:text-rose-800 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Check Status
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
