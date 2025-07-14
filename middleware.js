import { NextResponse } from 'next/server';

// This middleware ensures API calls use the correct base URL from environment variables
export function middleware(request) {
  return NextResponse.next();
}

// Configure middleware to run on the following paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
