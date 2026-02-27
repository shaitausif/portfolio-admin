import { NextRequest, NextResponse } from "next/server";
// Next.js middleware (like middleware.ts) runs on the Edge Runtime, which doesn't support jsonwebtoken. That's why jose is the recommended library for JWT in middleware.
import { jwtVerify } from "jose";
// getToken's Role: The getToken helper function is designed to read this JWT directly from the incoming request's cookies (or sometimes headers, depending on context and configuration). It then optionally verifies and decodes the token using your NEXTAUTH_SECRET.

const jsonSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

async function verifyCustomJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, jsonSecret);
    if (!payload) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const customToken = req.cookies.get("accessToken")?.value;
  const customJWT = customToken ? await verifyCustomJWT(customToken) : null;

  

  const publicRoutes = [
    "/login",
    "/forget-password",
    "/signup"
  ];

  const wildcardRoutes = ["/reset-password", "/verify-code", "/api", "/src/api"];

  const isPublic =
    publicRoutes.includes(pathname) ||
    wildcardRoutes.some((route) => pathname.startsWith(route));


  
  // If not authenticated and accessing a protected route → redirect to login
  if (!customJWT && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  


  // If authenticated and accessing a public page (login/forgot) → redirect to home
  if (customJWT && isPublic && !pathname.startsWith('/src/api') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // "These are exception routes it also includes "/" or homepage of the application"
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}