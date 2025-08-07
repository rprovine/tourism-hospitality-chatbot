import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/analytics',
  '/knowledge-base',
  '/api-settings',
  '/billing'
]

// Admin only routes
const adminRoutes = [
  '/admin'
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
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
    '/api-settings/:path*',
    '/billing/:path*',
    '/admin/:path*'
  ]
}