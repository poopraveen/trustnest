import { getGoogleOAuthCallbackUrl, isGoogleOAuthConfigured } from "@/lib/oauth-config";
import { getSiteUrl } from "@/lib/site-url";

/** Dev-only checklist for Google OAuth — shown on login/register */
export default function OAuthSetupHint() {
  if (process.env.NODE_ENV !== "development") return null;

  const siteUrl = getSiteUrl();
  const callbackUrl = getGoogleOAuthCallbackUrl();
  const hasGoogle = isGoogleOAuthConfigured();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() || "(not set)";

  return (
    <div className="w-full max-w-md mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-950">
      <p className="font-semibold mb-2">Google sign-in setup (local dev)</p>
      <ul className="space-y-1.5 list-disc list-inside text-amber-900/90">
        <li>
          <span className="font-medium">NEXTAUTH_URL</span>:{" "}
          <code className="bg-amber-100 px-1 rounded">{nextAuthUrl}</code>
          {nextAuthUrl !== siteUrl && (
            <span className="text-red-700"> — should match {siteUrl}</span>
          )}
        </li>
        <li>
          Add this <span className="font-medium">Authorized redirect URI</span> in{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Google Cloud Console
          </a>
          :
          <br />
          <code className="mt-1 block bg-amber-100 px-2 py-1 rounded break-all select-all">
            {callbackUrl}
          </code>
        </li>
        <li>
          OAuth app in <span className="font-medium">Testing</span> mode? Add your Gmail
          under Test users on the OAuth consent screen.
        </li>
        <li>
          Google credentials:{" "}
          {hasGoogle ? (
            <span className="text-emerald-700 font-medium">configured in .env</span>
          ) : (
            <span className="text-red-700 font-medium">missing GOOGLE_CLIENT_ID / SECRET</span>
          )}
        </li>
      </ul>
    </div>
  );
}
