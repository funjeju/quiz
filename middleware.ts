import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a basic middleware. Full Firebase Auth protection 
// usually requires session cookies or edge-friendly auth check.
// For now, we'll keep it simple or handle it via client-side protectors.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Logic for protecting /admin or /dashboard could go here
  // But since we use client-side Firebase, a true SSR/Edge middleware 
  // needs Firebase Admin or session cookies.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quiz/:path*',
    '/ranking/:path*',
    '/admin/:path*',
  ],
};
