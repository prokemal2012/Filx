import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  // Check if the path starts with /app (protected routes)
  if (req.nextUrl.pathname.startsWith('/app')) {
    // Get JWT token from cookies
    const token = req.cookies.get('auth')?.value;
    
    if (!token) {
      // No token found, redirect to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      // Create a new URL with the user ID as a search parameter
      const url = req.nextUrl.clone();
      url.searchParams.set('user', decoded.id);
      
      // Rewrite the request with the updated URL
      return NextResponse.rewrite(url);
    } catch (error) {
      // Invalid token, redirect to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // For non-protected routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
