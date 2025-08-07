import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // For admin routes, check if it's an admin user
      if (isAdminRoute && !decoded.isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', decoded.businessId || decoded.id)
      requestHeaders.set('x-user-email', decoded.email)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
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