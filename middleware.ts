// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'super-secret-at-least-32-characters-long-key'
);

const PROTECTED_ROUTES = [
  '/wallet', 
  '/tickets', 
  '/play', 
  '/account', 
  '/results', 
  '/admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicitly intercept /dashboard and redirect to root home
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const sessionToken = request.cookies.get('gz_session')?.value;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(sessionToken, JWT_SECRET);
    } catch {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};