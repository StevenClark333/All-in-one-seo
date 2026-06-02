import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth-constants";
import { isMutatingMethod, isTrustedRequestOrigin } from "@/lib/security";

const publicPrefixes = [
  "/login",
  "/signup",
  "/share",
  "/seo.js",
  "/downloads",
  "/_next",
  "/favicon.ico",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isMutatingMethod(request.method) &&
    !isTrustedRequestOrigin({
      origin: request.headers.get("origin"),
      requestUrl: request.url,
    })
  ) {
    return NextResponse.json(
      { error: "Cross-site requests are not allowed." },
      { status: 403 },
    );
  }

  if (isPublicPortalPath(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has(sessionCookieName)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};

export function isPublicPortalPath(pathname: string) {
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}
