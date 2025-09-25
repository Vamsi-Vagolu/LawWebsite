// filepath: c:\Users\vamsi\law-firm-site\src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ✅ ADD LOGIN PROTECTION FOR TEST ROUTES
  const protectedRoutes = ['/tests', '/admin', '/owner'];
  const requiresAuth = protectedRoutes.some(route => 
    pathname.startsWith(route) && pathname !== '/tests/public' // Optional: allow some public test routes
  );

  if (requiresAuth) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ✅ ONLY CHECK: Environment Variable (Simple & Fast)
  if (process.env.DISABLE_MAINTENANCE_CHECKING === 'true') {
    return NextResponse.next(); // Zero overhead - skip everything
  }

  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // ✅ DIRECT MAINTENANCE CHECK (No system status complexity)
    let isMaintenanceEnabled = false;
    
    try {
      const baseUrl = request.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/maintenance`);
      
      if (response.ok) {
        const data = await response.json();
        isMaintenanceEnabled = data.isEnabled;
      }
    } catch (fetchError) {
      return NextResponse.next();
    }

    // ✅ SIMPLE MAINTENANCE LOGIC
    if (isMaintenanceEnabled) {
      if (token?.role === 'OWNER') {
        return NextResponse.next();
      }
      
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
      
      return NextResponse.next();
    }

    if (!isMaintenanceEnabled && pathname === '/maintenance') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)',],
};