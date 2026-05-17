import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/** Prisma requires Node.js — Edge runtime causes OAuth Callback failures on Vercel */
export const runtime = "nodejs";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
