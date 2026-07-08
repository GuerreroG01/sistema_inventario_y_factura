import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const protectedRoutes = [
        "/products",
        "/sales",
        "/dashboard",
        "/inventory",
        "/expenses"
    ];

    const isProtected = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isProtected && !token) {
        return NextResponse.redirect(
            new URL("/auth/login", request.url)
        );
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/products/:path*",
        "/sales/:path*",
        "/dashboard/:path*",
        "/inventory/:path*",
        "/expenses/:path*"
    ]
};