# Tenant environment files

One Vercel project = one tenant. Each `*.env` file holds **branding** only; secrets stay in Vercel (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).

## Local dev

```bash
npm run tenant -- vepcitybazar
npm run dev:fresh
```

## Vercel — switch to VepCity (or any tenant)

### Why import fails with “No environment variables were created”

Vercel **does not overwrite** existing keys on bulk import. If `NEXT_PUBLIC_BRAND_NAME` (and the rest) are already set for TrustNest/TN Vettri, paste-import creates **zero** new rows.

**Fix (pick one):**

1. **Edit in place (recommended)**  
   Project → Settings → Environment Variables → search `NEXT_PUBLIC_BRAND` → open each → change value → Save → **Redeploy**.

2. **Delete then import**  
   Delete all `NEXT_PUBLIC_BRAND_*` keys (and `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` if switching domain) → paste from `vepcitybazar.vercel.txt` → Redeploy.

3. **Vercel CLI** (overwrite one key):
   ```bash
   vercel env rm NEXT_PUBLIC_BRAND_NAME production
   vercel env add NEXT_PUBLIC_BRAND_NAME production
   ```

### Generate paste file

```bash
npm run tenant:vercel -- vepcitybazar
# Custom deployment URL (required for a NEW Vercel project):
npm run tenant:vercel -- vepcitybazar -- --url https://vepcitybazar.vercel.app
```

Paste **only** the `KEY=value` lines (no `#` comments) into Vercel’s bulk import box.

### Required for a new VepCity deployment

| Variable | Example |
|----------|---------|
| `NEXTAUTH_URL` | `https://your-vepcity-project.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as above |
| `NEXT_PUBLIC_BRAND_DOMAIN` | `https://vepcitybazar.in` (custom domain when ready) |
| `DATABASE_URL` | Your Neon Postgres (can be new DB per tenant) |
| `NEXTAUTH_SECRET` | Random 32+ chars |
| Google OAuth redirect | `{NEXTAUTH_URL}/api/auth/callback/google` |

Remove placeholder social URLs (`https://api.example.com`) — use empty string or real profile links.
