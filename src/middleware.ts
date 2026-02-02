import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Rate Limiting for API Routes
  // Protect sensitive endpoints: Orders, Validation, Webhooks (optional)
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Stricter limit for orders (5 per minute)
    if (pathname.startsWith('/api/orders') && !rateLimit(`${ip}:orders`, 5, 60 * 1000)) {
       return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    // General limit for validations (20 per minute)
    if ((pathname.startsWith('/api/validate') && !rateLimit(`${ip}:validate`, 20, 60 * 1000))) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // 2. Auth Redirection (Existing Logic)
  // Redirect to dashboard if already logged in and visiting auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Security Headers
  const response = NextResponse.next();
  
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY'); // Prevent Clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  // Permissions Policy (Camera/Mic disabled by default)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
