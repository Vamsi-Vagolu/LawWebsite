// filepath: c:\Users\vamsi\law-firm-site\src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware checking:', pathname);

  // Skip maintenance check for specific paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/maintenance') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const maintenanceUrl = new URL('/api/maintenance-check', request.url);
    const response = await fetch(maintenanceUrl.toString());
    
    if (response.ok) {
      const { isEnabled } = await response.json();
      console.log('🔍 Maintenance status:', isEnabled);
      
      if (isEnabled) {
        console.log('🚧 MAINTENANCE ACTIVE - Checking user');
        
        const token = await getToken({ 
          req: request, 
          secret: process.env.NEXTAUTH_SECRET 
        });
        
        console.log('👤 User email:', token?.email);
        
        // ✅ Only allow specific owner email
        const isOwner = token?.email === 'v.vamsi3666@gmail.com';
        console.log('👑 Is owner?', isOwner);

        if (!isOwner) {
          console.log('🚧 REDIRECTING TO MAINTENANCE');
          return NextResponse.redirect(new URL('/maintenance', request.url));
        } else {
          console.log('✅ OWNER BYPASS - Allowing access');
        }
      }
    }
  } catch (error) {
    console.error('❌ Middleware error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)',
  ],
};