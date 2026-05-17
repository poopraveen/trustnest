import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "select_account",
              },
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    // Do not return false here — that causes error=AccessDenied on Vercel when DB is slow
    async signIn() {
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, name: true, avatar: true },
          });
          token.role = dbUser?.role ?? (user as { role?: string }).role ?? "BUYER";
          if (dbUser?.name) token.name = dbUser.name;
          if (dbUser?.avatar) token.picture = dbUser.avatar;
        } catch {
          token.role = (user as { role?: string }).role ?? "BUYER";
        }
      } else if (token.id && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "BUYER";
        } catch {
          token.role = "BUYER";
        }
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "BUYER";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return;
      try {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            emailVerified: new Date(),
            ...(user.name ? { name: user.name } : {}),
            ...(user.image ? { avatar: user.image } : {}),
          },
        });
      } catch (err) {
        console.error("[auth] optional Google profile sync failed:", err);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
