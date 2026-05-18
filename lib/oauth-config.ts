import { getSiteUrl } from "./site-url";

export function getGoogleOAuthCallbackUrl(): string {
  const base = getSiteUrl().replace(/\/+$/, "");
  return `${base}/api/auth/callback/google`;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}
