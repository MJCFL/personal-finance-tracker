import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check if user is authenticated
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const isAuthorized = isAuthenticated;
  
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Redirect logic
  if (pathname === '/') {
    // If at root, redirect to landing page for non-authenticated users
    // or to dashboard for authenticated users or demo mode
    if (isAuthorized) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Make sure we're using an absolute URL for the redirect
      const landingUrl = new URL('/landing', request.url);
      console.log('Redirecting unauthenticated user to:', landingUrl.toString());
      return NextResponse.redirect(landingUrl);
    }
  }
  
  // Protected routes - redirect to landing if not authenticated
  if (
    (pathname.startsWith('/dashboard') ||
     pathname.startsWith('/assets') ||
     pathname.startsWith('/transactions') ||
     pathname.startsWith('/accounts') ||
     pathname.startsWith('/budgets')) &&
    !isAuthorized
  ) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }
  
  // Get the response
  const response = NextResponse.next();
  
  // Add security headers
  const headers = response.headers;
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable Cross-Site Scripting (XSS) Protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://accounts.google.com https://*.googleapis.com;"
  );
  
  // HTTP Strict Transport Security
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  return response;
}
