import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/analytics',
  '/knowledge-base',
  '/ai-settings',
  '/ai',
  '/billing',
  '/channels',
  '/guests',
  '/revenue'
]

// Admin only routes
const adminRoutes = [
  '/admin'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Handle widget routes - remove X-Frame-Options to allow embedding
  if (path.startsWith('/widget/')) {
    const response = NextResponse.next()
    response.headers.delete('X-Frame-Options')
    response.headers.delete('Content-Security-Policy')
    return response
  }
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
  
  if (isProtectedRoute || isAdminRoute) {
    // Get token from cookie or header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // For now, just check if token exists
    // Token verification will be done in API routes
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/analytics/:path*',
    '/knowledge-base/:path*',
    '/ai-settings/:path*',
    '/ai/:path*',
    '/billing/:path*',
    '/channels/:path*',
    '/guests/:path*',
    '/revenue/:path*',
    '/admin/:path*',
    '/widget/:path*'
  ]
}