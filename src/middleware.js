import { NextResponse } from 'next/server';

export const OWNER_SESSION_COOKIE = 'pi_partner_engine_session';

/**
 * Next.js Middleware: Server-side route protection for /admin routes
 * Enforces role checks:
 *   - OWNER / ADMIN -> Allowed
 *   - WORKER -> Blocked from /admin
 *   - Unauthenticated -> Redirected to /login
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all /admin and legacy /portal-indore-ops-9821 routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/portal-indore-ops-9821')) {
    // Exclude /admin/login from blocking
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(OWNER_SESSION_COOKIE)?.value;
    const generalCookie = request.cookies.get('plumberindore_session')?.value;

    let userRole = null;

    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
        userRole = decoded?.role;
      } catch (e) {
        // invalid base64 cookie
      }
    } else if (generalCookie) {
      try {
        const parsed = JSON.parse(generalCookie);
        if (parsed?.role === 'admin' || parsed?.role === 'OWNER') {
          userRole = 'OWNER';
        } else if (parsed?.role === 'ADMIN') {
          userRole = 'ADMIN';
        } else if (parsed?.role === 'WORKER') {
          userRole = 'WORKER';
        }
      } catch (e) {}
    }

    // WORKER is explicitly forbidden from admin and ops portal
    if (userRole === 'WORKER') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'WORKER_FORBIDDEN');
      return NextResponse.redirect(loginUrl);
    }

    // Only OWNER and ADMIN are permitted
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal-indore-ops-9821/:path*', '/portal-indore-ops-9821'],
};
