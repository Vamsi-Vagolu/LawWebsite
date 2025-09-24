// filepath: c:\Users\vamsi\law-firm-site\src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Get maintenance status by calling API
    let isMaintenanceEnabled = false;
    
    try {
      const baseUrl = request.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/maintenance-check`, {
        headers: {
          'x-middleware': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        isMaintenanceEnabled = data.isEnabled;
      }
    } catch (fetchError) {
      console.log('Maintenance API call failed, assuming maintenance is off');
      isMaintenanceEnabled = false;
    }

    if (isMaintenanceEnabled) {
      // Allow owners to access any page during maintenance
      if (token?.role === 'OWNER') {
        return NextResponse.next();
      }
      if (pathname === '/maintenance') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    if (!isMaintenanceEnabled && pathname === '/maintenance') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)',],
};

// In your page.tsx
async function getMaintenanceSettings() {
  // ✅ OWNER CHECK - Smart redirect for owners
  if (session?.user?.role === 'OWNER') {
    redirect('/owner');
    return;
  }
  // ... rest of function
}