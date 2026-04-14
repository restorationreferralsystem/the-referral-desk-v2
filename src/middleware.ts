import { auth } from './lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth',
  '/api/auth',
  '/r/',
  '/portal/',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  })

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check authentication
  const session = await auth()

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
