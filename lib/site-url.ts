/**
 * Canonical browser origin for metadata, sitemap, robots, and JSON-LD.
 *
 * Set NEXT_PUBLIC_APP_URL and NEXTAUTH_URL to the same origin you open in the
 * browser (including port), e.g. http://localhost:3002 when `next dev` uses 3002.
 *
 * If chunks fail to load (ChunkLoadError), stop the server, delete `.next`, and
 * run `npm run dev:fresh` — do not run `next build` and `next dev` on the same
 * `.next` folder concurrently.
 */
export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    const trimmed = raw.trim().replace(/\/+$/, "");
    try {
      const u = new URL(trimmed);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return u.origin;
      }
    } catch {
      /* try next candidate */
    }
  }

  return "http://localhost:3000";
}
