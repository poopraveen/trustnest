import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function stripLocalePrefix(pathname: string): string {
  if (pathname === "/ta" || pathname === "/en") return "/";
  if (pathname.startsWith("/ta/")) return pathname.slice("/ta".length) || "/";
  if (pathname.startsWith("/en/")) return pathname.slice("/en".length) || "/";
  return pathname;
}

function localePrefixFromPath(pathname: string): "" | "/ta" | "/en" {
  if (pathname === "/ta" || pathname.startsWith("/ta/")) return "/ta";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "/en";
  return "";
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const path = stripLocalePrefix(pathname);
  const localePrefix = localePrefixFromPath(pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (
    (path.startsWith("/seller") || path.startsWith("/admin")) &&
    !token
  ) {
    const login = new URL(`${localePrefix}/login`, req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`${localePrefix}/`, req.url));
  }

  if (
    path.startsWith("/seller") &&
    token?.role !== "SELLER" &&
    token?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL(`${localePrefix}/become-seller`, req.url));
  }

  const needsAuth =
    path === "/saved" ||
    path.startsWith("/saved/") ||
    path === "/saved-products" ||
    path.startsWith("/saved-products/") ||
    path === "/checkout" ||
    path === "/orders" ||
    path.startsWith("/orders/") ||
    path.startsWith("/profile");

  if (needsAuth && !token) {
    const login = new URL(`${localePrefix}/login`, req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
