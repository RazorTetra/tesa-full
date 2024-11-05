// middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
    
    // Jika mencoba mengakses route admin tapi bukan admin
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token; // Harus login untuk akses dashboard
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"]
};