// middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
    const isStudentRoute = req.nextUrl.pathname.startsWith("/dashboard/siswa");
    
    // Jika mencoba mengakses route admin tapi bukan admin
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Jika user biasa mencoba mengakses data siswa lain
    if (isStudentRoute && token?.role === "user" && !req.nextUrl.pathname.includes(token.id)) {
      return NextResponse.redirect(new URL("/dashboard/siswa/" + token.id, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  }
);