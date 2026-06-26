
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/tasks", "/measure", "/stats", "/account", "/rank-test", "/admin"];
const cookieName = process.env.AUTH_COOKIE_NAME ?? "gl_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get(cookieName)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/measure/:path*", "/stats/:path*", "/account/:path*", "/rank-test/:path*", "/admin/:path*"]
};
