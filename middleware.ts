import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  findTenantMembership,
  hasTenantRole,
  isGlobalAdmin,
} from "@/lib/auth/permissions";
import { rootDomain } from "@/lib/config/site";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

function redirectToSignIn(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const callbackUrl =
    request.nextUrl.pathname + request.nextUrl.search + request.nextUrl.hash;
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(loginUrl);
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  const session = request.auth;

  if (subdomain) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }

    const tenantProtectedPaths = ["/dashboard", "/settings"];
    if (tenantProtectedPaths.some((segment) => pathname.startsWith(segment))) {
      if (!session?.user) {
        return redirectToSignIn(request);
      }

      const membership = findTenantMembership(
        session.user.tenantAccess,
        subdomain
      );

      if (!hasTenantRole(membership)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return redirectToSignIn(request);
    }

    if (!isGlobalAdmin(session.user.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return redirectToSignIn(request);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
