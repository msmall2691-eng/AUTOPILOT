import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/jobs",
  "/clients",
  "/invoices",
  "/estimates",
  "/calendar",
  "/dispatch",
  "/phone",
  "/messages",
  "/marketing",
  "/team",
  "/reports",
  "/settings",
  "/ad-tracking",
  "/properties",
];

const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Check if the path is a protected dashboard route
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Check if on auth pages
  const isAuthPage = authPaths.some((p) => pathname === p);

  // Redirect unauthenticated users to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (handled by their own auth)
     * - _next (static files)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
};
