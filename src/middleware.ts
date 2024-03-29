import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    // relative path
    const pathname = req.nextUrl.pathname
    // get session token
    const sessionToken = req.cookies.get('next-auth.session-token')

    // Manage route protection
    const isAuth = !!sessionToken

    // Manage protected routes
    const sensitiveRoutes = ['/admin']
    const notWithSession = ['/login']

    // Check if user is authenticated and trying to access a sensitive route
    if (
      !isAuth &&
      sensitiveRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Check if user is authenticated and trying to access a route that is not allowed with session
    if (
      isAuth &&
      notWithSession.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/admin', '/login'],
}