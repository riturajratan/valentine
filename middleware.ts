import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuthenticated = !!req.auth

  // Protect /api/generate - require authentication
  if (req.nextUrl.pathname.startsWith('/api/generate')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', requiresAuth: true },
        { status: 401 }
      )
    }
  }

  // Protect /dashboard - require authentication
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Protect API routes that need auth
    '/api/generate',
    // Protect dashboard page
    '/dashboard',
  ],
}
