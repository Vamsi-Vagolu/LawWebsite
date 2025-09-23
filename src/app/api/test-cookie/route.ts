import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🍪 Setting test maintenance cookie');
  
  const response = NextResponse.json({ 
    message: 'Test cookie set',
    timestamp: new Date().toISOString()
  });
  
  response.cookies.set('maintenance-mode', 'true', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/'
  });
  
  return response;
}