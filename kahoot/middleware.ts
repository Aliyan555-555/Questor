import { NextRequest, NextResponse } from "next/server";
import { Logout } from "./src/redux/api";

const protectedRoutes = ["/reports", "/auth/profile", "/api/private", "/play"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;
  console.warn("Session token:", token);
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL("/auth/logout", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/auth/verify-token`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const loginUrl = new URL("/auth/logout", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const data = await res.json();
    } catch (err) {
      return NextResponse.json(
        { message: "Token verification failed" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|public).*)"],
};
