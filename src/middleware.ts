import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the is_admin cookie is present and true
  const isAdmin = request.cookies.get('is_admin')?.value;

  // If trying to access any dashboard route without the cookie, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (isAdmin !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If they are on the login page but already have the cookie, redirect to dashboard
  if (request.nextUrl.pathname === '/login') {
    if (isAdmin === 'true') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
